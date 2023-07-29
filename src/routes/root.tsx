import { useEffect, useState } from "react";
import axios from "axios";
function Root(): JSX.Element {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const script: HTMLScriptElement = document.createElement("script");
    script.src =
      "https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (token === "") {
      window.onload = function () {
        window.YaAuthSuggest.init(
          {
            client_id: import.meta.env.VITE_YANDEX_CLIENT_ID,
            response_type: "token",
            redirect_uri: "http://localhost:5173/auth",
          },
          "http://localhost:5173",
          {
            view: "button",
            parentId: "yandex-auth",
            buttonView: "main",
            buttonTheme: "light",
            buttonSize: "s",
            buttonBorderRadius: 0,
          }
        )
          .then(({ handler }) => handler())
          .then((data: { access_token: string }) => setToken(data.access_token))
          .catch((error) => console.log("Обработка ошибки", error));
      };
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files.length >= 100 || selectedFiles.length >= 100) {
      alert("Максимальное количество файлов для загрузки - 100");
      return;
    }
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleUpload = async () => {
    const YANDEX_DISK_UPLOAD_API_URL =
      "https://cloud-api.yandex.net/v1/disk/resources/upload";
    const folderPath = "/"; // Путь к папке на Яндекс.диске, куда будут загружаться файлы

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.get(YANDEX_DISK_UPLOAD_API_URL, {
          headers: {
            Authorization: `OAuth ${token}`,
          },
          params: {
            path: folderPath + file.name,
            overwrite: true,
          },
        });

        setUploading(true);

        await axios.put(response.data.href, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log(`${file.name} has been uploaded successfully.`);
        setUploadedFiles([...uploadedFiles, file]);
      }

      setUploading(false);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  return (
    <div>
      <h1>Yandex.Disk Uploader</h1>
      {token !== "" ? (
        <div className="choose-upload-container">
          <input
            type="file"
            id="file-input"
            onChange={handleFileChange}
            multiple
          />
          <label htmlFor="file-input">Выбрать файлы</label>
          <button onClick={handleUpload}>
            {uploading ? "Загрузка..." : "Загрузить"}
          </button>
        </div>
      ) : (
        "Для начала вы должны авторизоваться:"
      )}
      <div id="yandex-auth"></div>
      {selectedFiles.length > 0 && (
        <div>
          <h2>Выбранные файлы:</h2>
          <ul>
            {selectedFiles.map((file, index) => (
              <li
                key={index}
                className={uploadedFiles.includes(file) ? "fileUploaded" : ""}
              >
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Root;
