import React, { useState } from "react";

import axios from "axios";

import "./App.css";


function App() {

  // Upload States
  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [uploadSuccess, setUploadSuccess] =
    useState<boolean>(false);

  const [chunks, setChunks] =
    useState<number>(0);

  const [error, setError] =
    useState<string>("");


  // Question States
  const [question, setQuestion] =
    useState<string>("");

  const [answer, setAnswer] =
    useState<string>("");

  const [asking, setAsking] =
    useState<boolean>(false);


  // File Change
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const selectedFile =
      e.target.files?.[0];

    if (selectedFile) {

      if (
        selectedFile.type ===
        "application/pdf"
      ) {

        setFile(selectedFile);

        setError("");

      } else {

        setError(
          "Please upload valid PDF file"
        );
      }
    }
  };


  // Upload PDF
  const handleUpload = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    if (!file) {

      setError(
        "Please select PDF file"
      );

      return;
    }

    try {

      setLoading(true);

      setError("");

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await axios.post(
          "http://127.0.0.1:8000/upload",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      setChunks(
        response.data.chunks_created
      );

      setUploadSuccess(true);

    } catch (err: any) {

      setError(
        err.response?.data?.detail ||
        "Upload failed"
      );

    } finally {

      setLoading(false);
    }
  };


  // Ask Question
  const handleAskQuestion = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    if (!question) {

      setError(
        "Please enter question"
      );

      return;
    }

    try {

      setAsking(true);

      setError("");

      const response =
        await axios.post(
          `http://127.0.0.1:8000/ask?question=${question}`
        );

      setAnswer(
        response.data.answer
      );

    } catch (err: any) {

      setError(
        err.response?.data?.detail ||
        "Question failed"
      );

    } finally {

      setAsking(false);
    }
  };


  return (

    <div className="app-container">

      <div className="card">

        <h1>
          📚 RAG AI Assistant
        </h1>

        <p className="subtitle">

          Upload PDF and Ask Questions

        </p>


        {/* Upload Section */}
        <form
          onSubmit={handleUpload}
          className="upload-form"
        >

          <label className="upload-box">

            📂 Click To Upload PDF

            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              hidden
            />

          </label>


          {
            file && (

              <div className="file-info">

                <p>
                  📄 {file.name}
                </p>

              </div>
            )
          }


          <button
            type="submit"
            disabled={loading}
            className="btn"
          >

            {
              loading
                ? "Uploading..."
                : "Upload PDF"
            }

          </button>

        </form>


        {/* Success */}
        {
          uploadSuccess && (

            <div className="success-box">

              ✅ PDF Uploaded Successfully

              <br />

              📊 Chunks Created:
              {chunks}

            </div>
          )
        }


        {/* Ask Question Section */}
        {
          uploadSuccess && (

            <form
              onSubmit={handleAskQuestion}
              className="question-form"
            >

              <textarea
                placeholder="Ask question from PDF..."
                value={question}
                onChange={(e) =>
                  setQuestion(
                    e.target.value
                  )
                }
                className="question-input"
              />


              <button
                type="submit"
                disabled={asking}
                className="btn"
              >

                {
                  asking
                    ? "Thinking..."
                    : "Ask AI"
                }

              </button>

            </form>
          )
        }


        {/* Answer */}
        {
          answer && (

            <div className="answer-box">

              <h3>
                🤖 AI Answer
              </h3>

              <p>
                {answer}
              </p>

            </div>
          )
        }


        {/* Error */}
        {
          error && (

            <div className="error-box">

              ⚠️ {error}

            </div>
          )
        }

      </div>

    </div>
  );
}

export default App;