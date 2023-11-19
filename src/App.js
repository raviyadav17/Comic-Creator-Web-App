import React from "react";
import "./App.css"; // Import the CSS file
import ComicGenerator from "./ComicGenerator";

const App = () => {
  return (
    <div className="App">
      <h1>Comic Strip Generator</h1>
      <ComicGenerator />
    </div>
  );
};

export default App;
