document.addEventListener("DOMContentLoaded", function () {
    let typeSelect = document.getElementById("typeSelect");
    let animeField = document.getElementById("animeField");
    let fileUpload = document.getElementById("fileUpload");
    let uploadBtn = document.getElementById("uploadBtn");
    let progressBar = document.getElementById("uploadProgress");
    const dropZone = document.getElementById("dropZone");
    const selectedFiles = document.getElementById("selectedFiles");

    // Hide/show the anime field based on selection
    function toggleAnimeField() {
        animeField.style.display = typeSelect.value === "Movies" ? "none" : "block";
    }

    typeSelect.addEventListener("change", toggleAnimeField);
    toggleAnimeField(); // Run on page load

    // Handle file selection display
    function updateFileSelection() {
        const files = fileUpload.files;
        if (files.length > 0) {
            selectedFiles.textContent = `Selected ${files.length} file(s): ${Array.from(files).map(f => f.name).join(', ')}`;
        } else {
            selectedFiles.textContent = '';
        }
    }

    // Add click handler for the upload box
    dropZone.addEventListener("click", () => {
        fileUpload.click();
    });

    // Handle file selection
    fileUpload.addEventListener("change", updateFileSelection);

    // Handle drag and drop
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        fileUpload.files = e.dataTransfer.files;
        updateFileSelection();
    });

    // Handle file upload
    uploadBtn.addEventListener("click", function () {
        let files = fileUpload.files;
        if (files.length === 0) {
            alert("Please select a file to upload.");
            return;
        }

        // Set base path and get content type
        const basePath = 'jellyfin/uploads';
        let contentType = typeSelect.value;
        let finalPath = '';
        let nameField = '';

        // Construct path based on content type
        switch(contentType) {
            case 'Movies':
                finalPath = `${basePath}/Movies`;
                break;
            case 'Anime':
                nameField = document.getElementById('animeName').value.trim();
                if (!nameField) {
                    alert("Please enter the anime name!");
                    return;
                }
                nameField = nameField.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-');
                finalPath = `${basePath}/Anime/${nameField}`;
                break;
            case 'Shows':
                nameField = document.getElementById('animeName').value.trim();
                if (!nameField) {
                    alert("Please enter the show name!");
                    return;
                }
                nameField = nameField.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-');
                finalPath = `${basePath}/Shows/${nameField}`;
                break;
        }

        console.log("Final Path:", finalPath); // Log the path

        let formData = new FormData();
        // Append the text field first
        formData.append("path", finalPath);
        Array.from(files).forEach(file => {
            formData.append("files", file);
        });

        progressBar.value = 0;

        let progress = 0;
        let uploadInterval;

        // Start progress simulation
        uploadInterval = setInterval(() => {
            if (progress < 90) {
                progress += 10;
                progressBar.value = progress;
            }
        }, 300);

        fetch("/upload", {
            method: "POST",
            body: formData
        })
        .then(async response => {
            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (!contentType || !contentType.includes("application/json")) {
                return response.text().then(text => {
                    throw new Error(`Server returned ${contentType || 'no content type'}: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            clearInterval(uploadInterval);
            if (data.success) {
                progressBar.value = 100;
                alert(data.message);
            } else {
                throw new Error(data.message || "Upload failed!");
            }
        })
        .catch(err => {
            console.error("Upload error:", err);
            clearInterval(uploadInterval);
            progressBar.value = 0;
            alert("Error uploading files: " + err.message);
        })
        .finally(() => {
            // Ensure interval is cleared in all cases
            clearInterval(uploadInterval);
        });
    });
});
