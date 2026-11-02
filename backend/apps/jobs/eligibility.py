from django.utils import timezone
from apps.students.skill_engine import calculate_skill_match


def check_student_eligibility(student_profile, job_posting, existing_application=None):
    """
    Evaluates student eligibility for a job posting against all criteria.
    Returns:
    {
        'is_eligible': bool,
        'criteria_checks': list[dict],
        'failure_reasons': list[str],
        'passed_reasons': list[str],
        'skill_match': dict,
        'has_applied': bool
    }
    """
    criteria = getattr(job_posting, 'eligibility_criteria', None)
    failure_reasons = []
    passed_reasons = []
    criteria_checks = []

    # 1. Job Status check
    if job_posting.status != 'APPROVED':
        failure_reasons.append("Job is not currently accepting applications (not in approved status).")
        criteria_checks.append({'name': 'Job Status', 'passed': False, 'message': 'Job is not approved.'})
    else:
        passed_reasons.append("Job is actively accepting applications.")
        criteria_checks.append({'name': 'Job Status', 'passed': True, 'message': 'Active & Approved'})

    # 2. Deadline check
    now = timezone.now()
    if now > job_posting.application_deadline:
        failure_reasons.append(f"Application deadline has passed ({job_posting.application_deadline.strftime('%Y-%m-%d %H:%M UTC')}).")
        criteria_checks.append({'name': 'Application Deadline', 'passed': False, 'message': 'Deadline expired'})
    else:
        passed_reasons.append(f"Application deadline is open until {job_posting.application_deadline.strftime('%Y-%m-%d %H:%M UTC')}.")
        criteria_checks.append({'name': 'Application Deadline', 'passed': True, 'message': 'Deadline active'})

    # 3. Already applied check
    has_applied = False
    if existing_application is not None:
        has_applied = True
    else:
        # Check database
        from apps.applications.models import JobApplication
        if JobApplication.objects.filter(student=student_profile, job=job_posting).exists():
            has_applied = True

    if has_applied:
        failure_reasons.append("You have already applied to this job posting.")
        criteria_checks.append({'name': 'Application History', 'passed': False, 'message': 'Duplicate application not allowed'})

    # 4. Student overall placement status
    if not student_profile.is_placement_eligible:
        failure_reasons.append("Student profile is flagged as ineligible for placements by administration.")
        criteria_checks.append({'name': 'Placement Status', 'passed': False, 'message': 'Account marked ineligible'})
    else:
        criteria_checks.append({'name': 'Placement Status', 'passed': True, 'message': 'Eligible for campus placement'})

    # If job has specific eligibility criteria defined
    if criteria:
        # CGPA Check
        if student_profile.cgpa < criteria.min_cgpa:
            failure_reasons.append(
                f"CGPA is {student_profile.cgpa}, which is below the minimum required CGPA of {criteria.min_cgpa}."
            )
            criteria_checks.append({
                'name': 'Minimum CGPA',
                'passed': False,
                'required': f">= {criteria.min_cgpa}",
                'actual': str(student_profile.cgpa),
                'message': f"Required: {criteria.min_cgpa}, Actual: {student_profile.cgpa}"
            })
        else:
            passed_reasons.append(f"CGPA {student_profile.cgpa} meets requirement (min {criteria.min_cgpa}).")
            criteria_checks.append({
                'name': 'Minimum CGPA',
                'passed': True,
                'required': f">= {criteria.min_cgpa}",
                'actual': str(student_profile.cgpa),
                'message': f"Satisfied ({student_profile.cgpa} >= {criteria.min_cgpa})"
            })

        # Department Check
        if criteria.eligible_departments and 'All' not in criteria.eligible_departments:
            norm_student_dept = student_profile.department.strip().lower()
            norm_eligible_depts = [d.strip().lower() for d in criteria.eligible_departments]

            dept_matched = any(
                norm_student_dept == d or norm_student_dept in d or d in norm_student_dept
                for d in norm_eligible_depts
            )

            if not dept_matched:
                failure_reasons.append(
                    f"Department '{student_profile.department}' is not eligible. Accepted departments: {', '.join(criteria.eligible_departments)}."
                )
                criteria_checks.append({
                    'name': 'Eligible Department',
                    'passed': False,
                    'required': criteria.eligible_departments,
                    'actual': student_profile.department,
                    'message': f"Department '{student_profile.department}' not listed in eligible branches."
                })
            else:
                passed_reasons.append(f"Department '{student_profile.department}' is eligible.")
                criteria_checks.append({
                    'name': 'Eligible Department',
                    'passed': True,
                    'required': criteria.eligible_departments,
                    'actual': student_profile.department,
                    'message': 'Department eligible'
                })

        # Graduation Year Check
        if criteria.eligible_graduation_years:
            if student_profile.graduation_year not in criteria.eligible_graduation_years:
                failure_reasons.append(
                    f"Graduation year {student_profile.graduation_year} is not accepted. Eligible batches: {', '.join(map(str, criteria.eligible_graduation_years))}."
                )
                criteria_checks.append({
                    'name': 'Graduation Year',
                    'passed': False,
                    'required': criteria.eligible_graduation_years,
                    'actual': student_profile.graduation_year,
                    'message': f"Batch {student_profile.graduation_year} is not accepted."
                })
            else:
                passed_reasons.append(f"Graduation year {student_profile.graduation_year} is accepted.")
                criteria_checks.append({
                    'name': 'Graduation Year',
                    'passed': True,
                    'required': criteria.eligible_graduation_years,
                    'actual': student_profile.graduation_year,
                    'message': 'Graduation year accepted'
                })

        # Active Backlogs Check
        if student_profile.active_backlogs > criteria.max_active_backlogs:
            failure_reasons.append(
                f"Active backlogs ({student_profile.active_backlogs}) exceed allowed maximum ({criteria.max_active_backlogs})."
            )
            criteria_checks.append({
                'name': 'Active Backlogs',
                'passed': False,
                'required': f"<= {criteria.max_active_backlogs}",
                'actual': student_profile.active_backlogs,
                'message': f"{student_profile.active_backlogs} active backlogs (max {criteria.max_active_backlogs})"
            })
        else:
            passed_reasons.append(f"Active backlogs ({student_profile.active_backlogs}) within limit (max {criteria.max_active_backlogs}).")
            criteria_checks.append({
                'name': 'Active Backlogs',
                'passed': True,
                'required': f"<= {criteria.max_active_backlogs}",
                'actual': student_profile.active_backlogs,
                'message': 'Backlog count satisfied'
            })

        # Total Backlogs History Check
        if student_profile.total_backlogs_history > criteria.max_total_backlogs_history:
            failure_reasons.append(
                f"Total backlog history ({student_profile.total_backlogs_history}) exceeds allowed limit ({criteria.max_total_backlogs_history})."
            )
            criteria_checks.append({
                'name': 'Backlog History',
                'passed': False,
                'required': f"<= {criteria.max_total_backlogs_history}",
                'actual': student_profile.total_backlogs_history,
                'message': 'Backlog history exceeded'
            })

    # Skill match evaluation
    primary_resume = student_profile.primary_resume
    resume_skills = primary_resume.extracted_skills if primary_resume else []
    skill_match = calculate_skill_match(
        student_profile_skills=student_profile.technical_skills,
        resume_extracted_skills=resume_skills,
        job_required_skills=job_posting.required_skills,
        job_nice_to_have_skills=job_posting.nice_to_have_skills
    )

    if criteria and criteria.min_skill_match_percentage > 0:
        actual_pct = skill_match.get('match_percentage') or 0
        if actual_pct < criteria.min_skill_match_percentage:
            failure_reasons.append(
                f"Skill match of {actual_pct}% is lower than the required minimum threshold of {criteria.min_skill_match_percentage}%."
            )
            criteria_checks.append({
                'name': 'Skill Match Threshold',
                'passed': False,
                'required': f">= {criteria.min_skill_match_percentage}%",
                'actual': f"{actual_pct}%",
                'message': 'Skill match below threshold'
            })

    is_eligible = (len(failure_reasons) == 0)

    return {
        'is_eligible': is_eligible,
        'criteria_checks': criteria_checks,
        'failure_reasons': failure_reasons,
        'passed_reasons': passed_reasons,
        'skill_match': skill_match,
        'has_applied': has_applied
    }
