import React, { useState } from "react";

import axios from "axios";

import "./PdfUpload.css";


interface UploadResponse {
  chunks_created: number;
}


interface UploadedDoc {
  id: number;
  name: string;
  size: number;
  chunks: number;
  uploadedAt: string;
}


interface PdfUploadProps {
  onUploadSuccess: (
    chunks: number,
    name?: string
  ) => void;
}


function PdfUpload({
  onUploadSuccess,
}: PdfUploadProps) {

  const [file, setFile] =
    useState<File | null>(null);

  const [uploadedDocs, setUploadedDocs] =
    useState<UploadedDoc[]>([]);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [uploadProgress, setUploadProgress] =
    useState<number>(0);

  const [dragActive, setDragActive] =
    useState<boolean>(false);


  // File Change
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const selectedFile =
      e.target.files?.[0];

    if (selectedFile) {

      validateAndSetFile(
        selectedFile
      );
    }
  };


  // Validate PDF
  const validateAndSetFile = (
    selectedFile: File
  ) => {

    if (
      selectedFile.type ===
      "application/pdf"
    ) {

      setFile(selectedFile);

      setError(null);

    } else {

      setError(
        "Please upload valid PDF file"
      );

      setFile(null);
    }
  };


  // Drag Events
  const handleDrag = (
    e: React.DragEvent<HTMLDivElement>
  ) => {

    e.preventDefault();

    e.stopPropagation();

    if (
      e.type === "dragenter" ||
      e.type === "dragover"
    ) {

      setDragActive(true);

    } else if (
      e.type === "dragleave"
    ) {

      setDragActive(false);
    }
  };


  // Drop File
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {

    e.preventDefault();

    e.stopPropagation();

    setDragActive(false);

    const droppedFile =
      e.dataTransfer.files[0];

    if (droppedFile) {

      validateAndSetFile(
        droppedFile
      );
    }
  };


  // Upload Submit
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    if (!file) {

      setError(
        "Please select PDF file"
      );

      return;
    }

    setLoading(true);

    setError(null);

    setSuccess(null);

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    try {

      const response =
        await axios.post<UploadResponse>(
          "http://127.0.0.1:8000/upload",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },

            onUploadProgress: (
              progressEvent
            ) => {

              const total =
                progressEvent.total || 1;

              const percent =
                Math.round(
                  (
                    progressEvent.loaded *
                    100
                  ) / total
                );

              setUploadProgress(
                percent
              );
            },
          }
        );

      const newDoc: UploadedDoc = {

        id: Date.now(),

        name: file.name,

        size: file.size,

        chunks:
          response.data.chunks_created,

        uploadedAt:
          new Date().toLocaleString(),
      };

      setUploadedDocs([
        ...uploadedDocs,
        newDoc,
      ]);

      setSuccess(
        `Successfully created ${response.data.chunks_created} chunks`
      );

      onUploadSuccess(
        response.data.chunks_created,
        file.name
      );

      setFile(null);

    } catch (err: any) {

      setError(
        err.response?.data?.detail ||
        "Upload failed"
      );

    } finally {

      setLoading(false);

      setUploadProgress(0);
    }
  };


  // File Size
  const formatFileSize = (
    bytes: number
  ): string => {

    const kb =
      bytes / 1024;

    return `${kb.toFixed(2)} KB`;
  };


  return (

    <div className="pdf-upload">

      <form
        onSubmit={handleSubmit}
        className="upload-form"
      >

        <div
          className={`file-input-wrapper ${
            dragActive
              ? "drag-active"
              : ""
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >

          <label className="upload-label">

            📂 Drag & Drop PDF Here

            <br />

            OR

            <br />

            Click To Upload

            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input"
            />

          </label>

        </div>


        {
          file && (

            <div className="selected-file">

              <p>
                📄 {file.name}
              </p>

              <p>
                {formatFileSize(file.size)}
              </p>

            </div>
          )
        }


        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >

          {
            loading
              ? `Uploading ${uploadProgress}%`
              : "Upload PDF"
          }

        </button>

      </form>


      {
        error && (

          <div className="error-message">

            ⚠️ {error}

          </div>
        )
      }


      {
        success && (

          <div className="success-message">

            ✅ {success}

          </div>
        )
      }


      {
        uploadedDocs.length > 0 && (

          <div className="uploaded-documents">

            <h3>
              Uploaded Documents
            </h3>

            {
              uploadedDocs.map((doc) => (

                <div
                  key={doc.id}
                  className="document-item"
                >

                  <p>
                    📄 {doc.name}
                  </p>

                  <p>
                    Chunks:
                    {doc.chunks}
                  </p>

                  <p>
                    Uploaded:
                    {doc.uploadedAt}
                  </p>

                </div>
              ))
            }

          </div>
        )
      }

    </div>
  );
}

export default PdfUpload;