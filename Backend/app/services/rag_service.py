import re

from langchain.schema import Document


def split_documents(documents):

    text = " ".join([
        doc.page_content
        for doc in documents
    ])

    # Remove unwanted headers
    text = re.sub(
        r'Advanced RAG and AI Questions & Answers',
        '',
        text
    )

    text = re.sub(
        r'Question\s+Answer',
        '',
        text
    )

    # Split by question
    qa_sections = re.split(
        r'(?=What is )',
        text
    )

    chunks = []

    for section in qa_sections:

        clean_text = section.strip()

        if clean_text == "":
            continue

        chunks.append(
            Document(
                page_content=clean_text
            )
        )

    return chunks