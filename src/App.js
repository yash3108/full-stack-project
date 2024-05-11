import { useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

function App() {
  // input text
  const [input_text, setText] = useState("");
  // input_file
  const [input_file, setFile] = useState(null);
  // aws presignedurl api gateway endpoint
  const PRESIGNEDURL_API_ENDPOINT =
    "https://hixrj8oicf.execute-api.us-east-2.amazonaws.com/getPresignedFileURL";
  // aws dynamodb table api gateway endpoint    
  const DYNAMODB_API_ENDPOINT =
    "https://vmkze4oy21.execute-api.us-east-2.amazonaws.com/uploadToFileTable";

  // handle input text change event
  const handleTextChange = (event) => {
    setText(event.target.value)
  }

  // handle input file change event
  const handleFileChange = (event) => {
    console.log(event)
    setFile(event.target.files[0])
  }

  // handle form submit event
  const handleSubmit = async (event) => {

    event.preventDefault();

    // validating input text
    if (input_text == "") {
      alert("Please enter text!")
      return
    }
    // validating input file
    if (input_file == null) {
      alert("Please select text file!")
      return
    }

    // GET request: presigned URL
    const presignedURL_response = await axios({
      method: "GET",
      params: {
        fileName: uuidv4() + input_file.name
      },
      url: PRESIGNEDURL_API_ENDPOINT,
    })

    // console_log(presignedURL_response)

    //  s3 path for input file
    const s3Path = presignedURL_response.data.path;

    // PUT request: upload file to s3
    const s3_response = await fetch(presignedURL_response.data.uploadURL, {
      method: "PUT",
      body: input_file
    })

    // console.log(s3_response)

    // POST request: send inputs to dynamoDB
    const dynamoDB_response = await axios({
      method: "POST",
      params: {
        input_text: input_text,
        input_file_path: s3Path
      },
      url: DYNAMODB_API_ENDPOINT
    })

    // console.log(dynamoDB_response)

    alert("Successfully Submitted!")
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Text input:
        <input
          type="text"
          name="input_text"
          value={input_text}
          onChange={handleTextChange}
        />
      </label>
      <br></br>
      <label>File input:
        <input
          type="file"
          name="input_file"
          onChange={handleFileChange}
        />
      </label>
      <br></br>
      <input
        type="submit"
      />
    </form>
  )
}

export default App;
