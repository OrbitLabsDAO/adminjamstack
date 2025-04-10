const url = new URL(window.location.href);
let parts = url.pathname.split("/").filter(Boolean);
let tableName = parts.length > 1 ? parts[parts.length - 2] : null;

function checkForeign() {
  const looksUps = Array.from(
    document.querySelectorAll("[data-foreigntable], [data-foreignid]")
  )
    .map((field) => {
      const foreignTable = field.getAttribute("data-foreigntable") || "";
      const foreignId = field.getAttribute("data-foreignid") || "";
      const fieldName = field.name || "";
      return { foreignTable, foreignId, fieldName };
    })
    .filter(
      ({ foreignTable, foreignId, fieldName }) =>
        foreignTable && foreignId && fieldName
    ); // Only include fields with both attributes

  if (looksUps.length > 0) {
    // Convert the looksUps array to a JSON string

    //debug for testing more than one dropdown
    //looksUps.push({
    //  foreignTable: "property",
    //  foreignId: "id",
    //  fieldName: "inp-name",
    // });
    const bodyobjectjson = JSON.stringify(looksUps);
    //console.log(bodyobjectjson);
    xhrcall(
      0,
      apiUrl + "lookups",
      bodyobjectjson,
      "json",
      "",
      checkForeignDone
    );
  }

  function checkForeignDone(response) {
    response = JSON.parse(response);
    const data = response.data;
    console.log(data);
    Object.keys(data).forEach((fieldName) => {
      const selectEl = document.getElementById(fieldName);
      if (!selectEl) return;

      const firstOption = document.createElement("option");
      firstOption.value = "";
      firstOption.textContent = "Please Select";
      selectEl.innerHTML = "";
      selectEl.appendChild(firstOption);

      data[fieldName].forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        selectEl.appendChild(option);
      });

      // Restore selected value if we have editData
      const cleanName = fieldName.replace(/^inp-/, "");

      if (editData && editData[cleanName] !== undefined) {
        selectEl.value = editData[cleanName];
      } else {
        selectEl.selectedIndex = 0;
      }
    });
  }
}

document
  .getElementById("btn-create")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission

    const formData = new FormData(document.querySelector("form"));

    // Create a plain object from FormData and remove the 'inp-' prefix
    const formDataObject = {};
    let isValid = true;

    formData.forEach((value, key) => {
      // Remove 'inp-' from the field name
      const cleanedKey = key.replace(/^inp-/, "");
      formDataObject[cleanedKey] = value.trim();

      // Get the field element
      const field = document.getElementById("inp-" + cleanedKey);
      isValid = checkField(field, cleanedKey, value);
    });

    // Proceed if all validations pass
    if (isValid) {
      // Convert the object to JSON
      const requestBody = JSON.stringify(formDataObject);
      // Call the table endpoint
      let theUrl = apiUrl + `tables/${tableName}`;
      xhrcall(0, theUrl, requestBody, "json", "", getAddDone);
    }
  });

let getAddDone = (response) => {
  response = JSON.parse(response);
  if (response.status == "ok") showAlert("Record Added", 1);
  else showAlert(response.error, 2);
};

/**
 * Show an error message for a field
 */

let whenDocumentReady = (f) => {
  /in/.test(document.readyState)
    ? setTimeout("whenDocumentReady(" + f + ")", 9)
    : f();
};

whenDocumentReady(
  (isReady = () => {
    //check the fields for data_foreigntable
    checkForeign();
    // Show the table
    document.getElementById("showBody").classList.remove("d-none");
  })
);
