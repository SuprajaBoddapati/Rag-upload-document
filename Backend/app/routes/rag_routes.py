import os

from fastapi import APIRouter, UploadFile, File
from transformers import pipeline

from app.services.pdf_service import load_pdf
from app.services.rag_service import split_documents
from app.services.vector_service import create_vector_store

router = APIRouter()

UPLOAD_FOLDER = "uploads"

vectorstore = None

llm = pipeline(
    "text-generation",
    model="gpt2"
)




@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...)
):

    global vectorstore

    try:

        print("Upload Started")

        os.makedirs(
            UPLOAD_FOLDER,
            exist_ok=True
        )

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        with open(file_path, "wb") as f:

            f.write(await file.read())

        print("PDF Saved")

        documents = load_pdf(file_path)

        print("PDF Loaded")

        chunks = split_documents(documents)

        print("Chunks Created")

        vectorstore = create_vector_store(chunks)

        print("Vector Store Created")

        return {
            "message": "PDF uploaded successfully",
            "chunks_created": len(chunks)
        }

    except Exception as e:

        print("ERROR:", str(e))

        return {
            "error": str(e)
        }


@router.post("/ask")
async def ask_question(question: str):

    global vectorstore

    if vectorstore is None:

        return {
            "error": "Upload document first"
        }

    results = vectorstore.max_marginal_relevance_search(
        question,
        k=1,
        fetch_k=10
    )

    if not results:

        return {
            "answer": "No answer found"
        }

    context = "\n".join([
        doc.page_content
        for doc in results
    ])

    return {
        "question": question,
        "answer": context
    }