import chromadb
from chromadb.utils import embedding_functions

# Create embedding function
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Initialize DB
client = chromadb.Client()

collection = client.get_or_create_collection(
    name="resume_data",
    embedding_function=embedding_function
)


def store_resume_data(data: dict):
    documents = []

    # ✅ Helper: safely convert list → string
    def safe_join(items):
        result = []
        for item in items:
            if isinstance(item, str):
                result.append(item)
            elif isinstance(item, dict):
                # try extracting common fields
                value = (
                    item.get("name")
                    or item.get("title")
                    or item.get("skill")
                    or str(item)
                )
                result.append(value)
            else:
                result.append(str(item))
        return ", ".join(result)

    # ✅ Skills
    if "skills" in data:
        documents.append("Skills: " + safe_join(data["skills"]))

    # ✅ Experience
    if "experience" in data:
        exp_texts = []
        for exp in data["experience"]:
            if isinstance(exp, dict):
                text = f"{exp.get('title', '')} at {exp.get('company', '')} ({exp.get('duration', '')})"
            else:
                text = str(exp)
            exp_texts.append(text)
        documents.append("Experience: " + ", ".join(exp_texts))

    # ✅ Education
    if "education" in data:
        edu_texts = []
        for edu in data["education"]:
            if isinstance(edu, dict):
                text = f"{edu.get('degree', '')} - {edu.get('institute', '')}"
            else:
                text = str(edu)
            edu_texts.append(text)
        documents.append("Education: " + ", ".join(edu_texts))

    # ✅ Projects
    if "projects" in data:
        proj_texts = []
        for proj in data["projects"]:
            if isinstance(proj, dict):
                text = f"{proj.get('title', '')}: {proj.get('description', '')}"
            else:
                text = str(proj)
            proj_texts.append(text)
        documents.append("Projects: " + ", ".join(proj_texts))

    # 🔄 Store in DB
    for i, doc in enumerate(documents):
        collection.add(
            documents=[doc],
            ids=[f"doc_{i}"]
        )


        
def query_resume(query: str):
    results = collection.query(
        query_texts=[query],
        n_results=2
    )
    return results