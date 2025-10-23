# HNG13-stage1-backend: String Analyzer

A RESTful API service built with Node.js and Express that analyzes strings, computes their properties, and allows for retrieval and filtering of the stored data.

---

## Features

- **Analyze Strings**: Computes length, palindrome status, word count, unique characters, SHA256 hash, and character frequency.
- **CRUD Operations**: Create, Read, and Delete analyzed strings.
- **Advanced Filtering**: Filter strings based on their computed properties.
- **Natural Language Querying**: A simple heuristic-based endpoint to filter strings using natural language.

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Module System**: ES Modules (`import`/`export`)
- **Data Storage**: In-memory JavaScript Map
- **Hashing**: Node.js `crypto` module (SHA-256)

---

## API Endpoints

Here’s a quick guide on how to use the String Analyzer API. All examples use `curl` and assume the server is running on `http://localhost:3000`.

### **1. Analyze and Store a New String**

This is the main endpoint for adding and analyzing a new string. You just send a JSON payload with the string you want to analyze.

* **Endpoint**: `POST /strings`
* **Request Body**:
    ```json
    {
      "value": "A man a plan a canal Panama"
    }
    ```
* **Example Request**:
    ```bash
    curl -X POST http://localhost:3000/strings \
    -H "Content-Type: application/json" \
    -d '{"value": "A man a plan a canal Panama"}'
    ```
* **Success Response (`201 Created`)**: On success, it returns the full analysis of the string.
* **Heads up**: You'll get a `409 Conflict` if the string already exists, or a `400 Bad Request` if your JSON is messed up.

### **2. Get a Specific String**

Use this to retrieve the details for a string that's already in the system. Remember to URL-encode the string value in the path.

* **Endpoint**: `GET /strings/{string_value}`
* **Example Request**:
    ```bash
    curl http://localhost:3000/strings/A%20man%20a%20plan%20a%20canal%20Panama
    ```
* **Success Response (`200 OK`)**: Returns the same JSON object you got when you first created it.
* **Heads up**: If the string isn't found, you'll get a `404 Not Found`.

### **3. Get All Strings (with Filtering)**

This endpoint pulls all the strings in the database. You can also chain query parameters to filter the results.

* **Endpoint**: `GET /strings`
* **Example Request (filtering for palindromes with at least 20 characters)**:
    ```bash
    curl "http://localhost:3000/strings?is_palindrome=true&min_length=20"
    ```
* **Supported Filters**: `is_palindrome`, `min_length`, `max_length`, `word_count`, `contains_character`.

### **4. Filter with Natural Language**

This is a more flexible endpoint that tries to understand a plain-English query to filter the strings.

* **Endpoint**: `GET /strings/filter-by-natural-language`
* **Example Request**:
    ```bash
    curl "http://localhost:3000/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings"
    ```
* **Success Response (`200 OK`)**: Returns the matching strings and shows you how it interpreted your query.

### **5. Delete a String**

Use this to remove a string from the system.

* **Endpoint**: `DELETE /strings/{string_value}`
* **Example Request**:
    ```bash
    curl -X DELETE http://localhost:3000/strings/A%20man%20a%20plan%20a%20canal%20Panama
    ```
* **Success Response (`204 No Content`)**: If it works, you get an empty response with a `204` status code.
* **Heads up**: If the string doesn't exist, you'll get a `404 Not Found`.

---

## Setup and Run Locally

### Prerequisites

-   Node.js
-   npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Abdulbaasiterinkitola/HNG13-stage1-backend
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd HNG13-stage1-backend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

To start the server, run the following command:

```bash
node index.js
