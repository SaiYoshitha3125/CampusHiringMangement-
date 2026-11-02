"""
CampusHire Explainable Skill Extraction and Matching Engine.
Provides rule-based, deterministic, explainable skill extraction and matching.
Designed to be modular for easy future extension with vector embeddings or semantic models.
"""

import re
import pymupdf


# Comprehensive taxonomy of technical skills with aliases and standardized display names
SKILL_TAXONOMY = {
    # Programming Languages
    'python': {'name': 'Python', 'aliases': ['python', 'py', 'python3', 'python2']},
    'javascript': {'name': 'JavaScript', 'aliases': ['javascript', 'js', 'es6', 'ecmascript']},
    'typescript': {'name': 'TypeScript', 'aliases': ['typescript', 'ts']},
    'java': {'name': 'Java', 'aliases': ['java', 'core java', 'j2ee']},
    'c++': {'name': 'C++', 'aliases': ['c++', 'cpp']},
    'c': {'name': 'C', 'aliases': ['c programming']},
    'c#': {'name': 'C#', 'aliases': ['c#', 'csharp', '.net']},
    'go': {'name': 'Go', 'aliases': ['golang', 'go lang']},
    'rust': {'name': 'Rust', 'aliases': ['rust']},
    'ruby': {'name': 'Ruby', 'aliases': ['ruby', 'ruby on rails', 'rails']},
    'php': {'name': 'PHP', 'aliases': ['php']},
    'kotlin': {'name': 'Kotlin', 'aliases': ['kotlin']},
    'swift': {'name': 'Swift', 'aliases': ['swift', 'swiftui', 'ios']},

    # Frontend Frameworks & Libraries
    'react': {'name': 'React', 'aliases': ['react', 'react.js', 'reactjs']},
    'vue': {'name': 'Vue.js', 'aliases': ['vue', 'vue.js', 'vuejs']},
    'angular': {'name': 'Angular', 'aliases': ['angular', 'angularjs', 'angular.js']},
    'next.js': {'name': 'Next.js', 'aliases': ['nextjs', 'next.js', 'next']},
    'html': {'name': 'HTML5', 'aliases': ['html', 'html5']},
    'css': {'name': 'CSS3', 'aliases': ['css', 'css3']},
    'tailwind': {'name': 'Tailwind CSS', 'aliases': ['tailwind', 'tailwindcss', 'tailwind css']},
    'bootstrap': {'name': 'Bootstrap', 'aliases': ['bootstrap', 'bootstrap5']},
    'redux': {'name': 'Redux', 'aliases': ['redux', 'redux toolkit']},

    # Backend Frameworks
    'django': {'name': 'Django', 'aliases': ['django', 'django rest framework', 'drf']},
    'flask': {'name': 'Flask', 'aliases': ['flask']},
    'fastapi': {'name': 'FastAPI', 'aliases': ['fastapi']},
    'node.js': {'name': 'Node.js', 'aliases': ['node', 'nodejs', 'node.js']},
    'express': {'name': 'Express.js', 'aliases': ['express', 'express.js', 'expressjs']},
    'spring boot': {'name': 'Spring Boot', 'aliases': ['spring', 'spring boot', 'springboot']},
    'asp.net': {'name': 'ASP.NET', 'aliases': ['asp.net', 'aspnet', '.net core', 'dotnet']},

    # Databases & Caching
    'sql': {'name': 'SQL', 'aliases': ['sql']},
    'postgresql': {'name': 'PostgreSQL', 'aliases': ['postgres', 'postgresql', 'psql']},
    'mysql': {'name': 'MySQL', 'aliases': ['mysql']},
    'mongodb': {'name': 'MongoDB', 'aliases': ['mongodb', 'mongo']},
    'redis': {'name': 'Redis', 'aliases': ['redis']},
    'sqlite': {'name': 'SQLite', 'aliases': ['sqlite', 'sqlite3']},
    'oracle': {'name': 'Oracle DB', 'aliases': ['oracle', 'oracle database']},

    # DevOps, Cloud & Tools
    'git': {'name': 'Git', 'aliases': ['git', 'github', 'gitlab', 'version control']},
    'docker': {'name': 'Docker', 'aliases': ['docker', 'containerization']},
    'kubernetes': {'name': 'Kubernetes', 'aliases': ['kubernetes', 'k8s']},
    'aws': {'name': 'AWS', 'aliases': ['aws', 'amazon web services', 'ec2', 's3', 'lambda']},
    'azure': {'name': 'Azure', 'aliases': ['azure', 'microsoft azure']},
    'gcp': {'name': 'GCP', 'aliases': ['gcp', 'google cloud', 'google cloud platform']},
    'ci/cd': {'name': 'CI/CD', 'aliases': ['ci/cd', 'cicd', 'jenkins', 'github actions']},
    'linux': {'name': 'Linux', 'aliases': ['linux', 'bash', 'shell scripting', 'unix']},

    # Data Science, ML & AI
    'machine learning': {'name': 'Machine Learning', 'aliases': ['machine learning', 'ml', 'scikit-learn']},
    'deep learning': {'name': 'Deep Learning', 'aliases': ['deep learning', 'dl']},
    'nlp': {'name': 'NLP', 'aliases': ['nlp', 'natural language processing']},
    'computer vision': {'name': 'Computer Vision', 'aliases': ['computer vision', 'cv', 'opencv']},
    'tensorflow': {'name': 'TensorFlow', 'aliases': ['tensorflow', 'tf']},
    'pytorch': {'name': 'PyTorch', 'aliases': ['pytorch', 'torch']},
    'pandas': {'name': 'Pandas', 'aliases': ['pandas']},
    'numpy': {'name': 'NumPy', 'aliases': ['numpy']},

    # Concepts & Architecture
    'data structures': {'name': 'Data Structures & Algorithms', 'aliases': ['data structures', 'dsa', 'algorithms']},
    'oop': {'name': 'Object-Oriented Programming', 'aliases': ['oop', 'oops', 'object oriented']},
    'rest api': {'name': 'RESTful APIs', 'aliases': ['rest api', 'restful api', 'rest apis', 'restful apis', 'api development']},
    'graphql': {'name': 'GraphQL', 'aliases': ['graphql']},
    'microservices': {'name': 'Microservices', 'aliases': ['microservices', 'microservice architecture']},
    'system design': {'name': 'System Design', 'aliases': ['system design', 'distributed systems']},
}

# Invert aliases for fast lookup
ALIAS_MAP = {}
for canonical_id, data in SKILL_TAXONOMY.items():
    for alias in data['aliases']:
        ALIAS_MAP[alias.lower()] = canonical_id
    ALIAS_MAP[canonical_id.lower()] = canonical_id


def normalize_skill(skill_str):
    """Normalize a skill string into its canonical ID and standard display name."""
    if not skill_str or not isinstance(skill_str, str):
        return None, None
    clean = skill_str.strip().lower()
    # Direct alias lookup
    if clean in ALIAS_MAP:
        canon_id = ALIAS_MAP[clean]
        return canon_id, SKILL_TAXONOMY[canon_id]['name']

    # Substring / pattern lookup
    for alias, canon_id in ALIAS_MAP.items():
        if alias == clean or (len(alias) > 3 and alias in clean):
            return canon_id, SKILL_TAXONOMY[canon_id]['name']

    # Fallback: Capitalize user skill
    return clean, skill_str.strip().title()


def extract_text_from_pdf(pdf_path_or_file):
    """
    Extracts readable text from a PDF file using PyMuPDF (fitz).
    Returns (extracted_text, status, notes).
    """
    try:
        if isinstance(pdf_path_or_file, str):
            doc = pymupdf.open(pdf_path_or_file)
        else:
            # File buffer or FieldFile
            doc = pymupdf.open(stream=pdf_path_or_file.read(), filetype="pdf")

        text_pages = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text_pages.append(page.get_text("text"))

        doc.close()
        full_text = "\n".join(text_pages).strip()

        if len(full_text) < 30:
            return full_text, "UNREADABLE", "Document contains very little or no extractable text. It may be a scanned image or protected PDF."

        return full_text, "SUCCESS", f"Successfully extracted {len(full_text)} characters across {len(text_pages)} pages."
    except Exception as e:
        return "", "FAILED", f"Error reading PDF file: {str(e)}"


def extract_skills_from_text(text):
    """
    Scans free text (such as resume content or job descriptions)
    and identifies recognized technical skills based on taxonomy.
    """
    if not text:
        return []

    found_skills = {}
    lower_text = " " + text.lower() + " "

    for alias, canon_id in ALIAS_MAP.items():
        # Word boundary match to avoid false substrings (e.g., 'c' in 'cat')
        pattern = r'(?:\b|[^a-zA-Z0-9#+])' + re.escape(alias) + r'(?:\b|[^a-zA-Z0-9#+])'
        if re.search(pattern, lower_text):
            standard_name = SKILL_TAXONOMY[canon_id]['name']
            found_skills[canon_id] = standard_name

    return sorted(list(found_skills.values()))


def calculate_skill_match(student_profile_skills, resume_extracted_skills, job_required_skills, job_nice_to_have_skills=None):
    """
    Explainable, rule-based skill matching engine.
    Matches candidate skills (profile + resume) against job required skills.

    Returns:
    {
        'match_percentage': float or None,
        'matched_skills': list[str],
        'missing_skills': list[str],
        'candidate_skills': list[str],
        'required_skills': list[str],
        'suggested_skills': list[str],
        'explanation': str
    }
    """
    # Combine candidate skills and normalize
    candidate_map = {}  # canon_id -> standard_name

    for s in (student_profile_skills or []):
        cid, name = normalize_skill(s)
        if cid:
            candidate_map[cid] = name

    for s in (resume_extracted_skills or []):
        cid, name = normalize_skill(s)
        if cid:
            candidate_map[cid] = name

    # Normalize required skills
    required_map = {}
    for s in (job_required_skills or []):
        cid, name = normalize_skill(s)
        if cid:
            required_map[cid] = name

    # Normalize nice-to-have skills
    nice_map = {}
    for s in (job_nice_to_have_skills or []):
        cid, name = normalize_skill(s)
        if cid:
            nice_map[cid] = name

    total_required = len(required_map)

    if total_required == 0:
        return {
            'match_percentage': None,
            'match_percentage_display': 'Not available',
            'matched_skills': [],
            'missing_skills': [],
            'candidate_skills': sorted(list(candidate_map.values())),
            'required_skills': [],
            'suggested_skills': sorted(list(nice_map.values()))[:5],
            'explanation': 'This job posting does not list specific required technical skills, so a direct skill match percentage cannot be computed.'
        }

    matched_canon = [cid for cid in required_map if cid in candidate_map]
    missing_canon = [cid for cid in required_map if cid not in candidate_map]

    matched_skills = [required_map[cid] for cid in matched_canon]
    missing_skills = [required_map[cid] for cid in missing_canon]

    match_percentage = round((len(matched_skills) / total_required) * 100.0, 1)

    # Suggestions: missing required skills + relevant nice to have
    suggested = list(missing_skills)
    for cid, name in nice_map.items():
        if cid not in candidate_map and name not in suggested:
            suggested.append(name)

    # Readable explanation
    if match_percentage == 100.0:
        explanation = f"Outstanding match! Your profile and resume cover all {total_required} required skills for this position."
    elif match_percentage >= 75.0:
        explanation = f"Strong match! You satisfy {len(matched_skills)} of {total_required} required skills ({match_percentage}%). Learning {', '.join(missing_skills[:2])} will make you an even stronger candidate."
    elif match_percentage >= 50.0:
        explanation = f"Moderate match: You have {len(matched_skills)} of {total_required} required skills ({match_percentage}%). Consider strengthening: {', '.join(missing_skills)}."
    else:
        explanation = f"Low match: You currently match {len(matched_skills)} of {total_required} required skills ({match_percentage}%). Required skills you might need: {', '.join(missing_skills)}."

    return {
        'match_percentage': match_percentage,
        'match_percentage_display': f"{match_percentage}%",
        'matched_skills': sorted(matched_skills),
        'missing_skills': sorted(missing_skills),
        'candidate_skills': sorted(list(candidate_map.values())),
        'required_skills': sorted(list(required_map.values())),
        'suggested_skills': suggested[:6],
        'explanation': explanation
    }
