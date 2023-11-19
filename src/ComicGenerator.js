import React, { useState, useRef } from "react";
// import html2canvas from "html2canvas";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ComicGenerator.css";

const ComicGenerator = () => {
  const [textInputs, setTextInputs] = useState(Array(10).fill(""));
  const [comicStrips, setComicStrips] = useState(Array(10).fill(null));
  const [isLoading, setIsLoading] = useState(false);
  const comicStripsRef = useRef();

  const handleInputChange = (e, index) => {
    const newInputs = [...textInputs];
    newInputs[index] = e.target.value;
    setTextInputs(newInputs);
  };

  const generateComicStrips = async () => {
    try {
      // Check if at least one text input is filled
      if (!textInputs.some((text) => text.trim() !== "")) {
        toast.error("Please fill at least one text input field.");
        return;
      }

      setIsLoading(true);

      const promises = textInputs.map(async (text, index) => {
        const response = await query({ inputs: text });
        return { index, url: URL.createObjectURL(response) };
      });

      const results = await Promise.all(promises);

      setComicStrips((prevStrips) => {
        const newStrips = [...prevStrips];
        results.forEach(({ index, url }) => {
          newStrips[index] = url;
        });
        return newStrips;
      });
    } catch (error) {
      console.error("Error generating comic strips:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAllImages = async () => {
    try {
      if (!comicStrips.some((strip) => strip !== null)) {
        toast.error("Please generate comic strips before downloading.");
        return;
      }
      // Create an array of Promises to load images
      const imagePromises = comicStrips.map(async (strip) => {
        const img = new Image();
        img.src = strip;
        await img.decode(); // Ensure the image is loaded
        return img;
      });

      const images = await Promise.all(imagePromises);

      // Calculate the canvas size based on the image dimensions
      const canvasWidth = images[0].width * 5; // Assuming all images have the same width
      const canvasHeight = images[0].height * 2; // Assuming all images have the same height

      // Create a canvas element
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const context = canvas.getContext("2d");

      // Draw images on the canvas in a 5x2 grid
      images.forEach((img, index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        context.drawImage(img, col * img.width, row * img.height);
      });

      // Convert canvas to data URL
      const dataURL = canvas.toDataURL("image/png");

      // Create a link and trigger a download
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "comic_strips.png";
      link.click();
    } catch (error) {
      console.error("Error downloading images:", error);
    }
  };

  const query = async (data) => {
    const response = await fetch(
      "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
      {
        headers: {
          Accept: "image/png",
          Authorization:
            "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.blob();
    return result;
  };

  return (
    <div className="input">
      {[...Array(10)].map((_, index) => (
        <div key={index} className="input-section">
          <input
            type="text"
            placeholder={`Enter text for comic strip ${index + 1}...`}
            value={textInputs[index]}
            onChange={(e) => handleInputChange(e, index)}
          />
        </div>
      ))}

      <div className="button-container">
        <button
          onClick={generateComicStrips}
          disabled={isLoading}
          className="generate-button"
        >
          {isLoading ? "Generating..." : "Generate Comic Strips"}
        </button>

        <button onClick={downloadAllImages} className="download-button">
          Download All
        </button>
      </div>

      <div className="comic-strips" ref={comicStripsRef}>
        {comicStrips.map(
          (strip, index) =>
            strip && (
              <img key={index} src={strip} alt={`Comic Strip ${index + 1}`} />
            )
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ComicGenerator;
