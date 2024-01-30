const NEW_STYLE_NAME = "newTestExtStyle";
const NEW_COLOR_COLLECTION_NAME = "newTestExtTextColorVariable";
let fontFamily;
let fontSize;
let fontColor;

let workingStyle;
let workingCollection;

// References to inputs to grab values (and labels to update values accordingly)
const fontSizeInput = document.getElementById("font-size-input") as HTMLInputElement;
let fontSizeLabel = document.getElementById("font-size-display");

const fontFamilyInput = document.getElementById("font-family-input") as HTMLSelectElement;

const fontColorInput = document.getElementById("font-color-input") as HTMLInputElement;
let fontColorLabel = document.getElementById("font-color-display");

// Watch for font family input change
fontFamilyInput.addEventListener("change", function() {
  fontFamily = fontFamilyInput.value;
  console.log("FONT FAMILY", fontFamily);
});

// Watch for font size input change
fontSizeInput.addEventListener('input', function() {
  if (!fontSizeLabel) {
    fontSizeLabel = document.getElementById("font-size-display");
  }
  fontSize = fontSizeInput.value;
  fontSizeLabel.textContent = `${fontSizeInput.value}px`;
});

// Watch for font color input change
fontColorInput.addEventListener("change", function() {
  if (!fontColorLabel) {
    fontColorLabel = document.getElementById("font-color-display");
  }
  fontColor = fontColorInput.value;
  fontColorLabel.textContent = fontColor;
});

// Create a variable for color to save to the style, along with other style properties
async function setStyleProperties(style) {
  let variable = await workingCollection.getVariableByName(NEW_COLOR_COLLECTION_NAME);
  if (!variable) {
    console.log("MAKING A VARIABLE", fontColor);
    variable = await workingCollection.createColorVariable(NEW_COLOR_COLLECTION_NAME, fontColor);
  } else {
    console.log("EDITING A VARIABLE", fontColor);
    await variable.set(fontColor);
  }
  console.log(variable);
  style.setProperties({
    'font-size': `${fontSizeInput.value}px`,
    'font-family': fontFamily,
    color: variable,
  });
}


// When preview button is clicked, save styles from the form
document.getElementById("main-form").onsubmit = async (event) => {
  event.preventDefault()
  // Get the currently selected element in the Designer
  const el = await webflow.getSelectedElement();


  if (el && el.textContent) {
    const currentStyles = await el.getStyles();
    workingCollection = await webflow.getDefaultVariableCollection();

    // If we don't have a reference to a working style, create one and save it
    if (!workingStyle) {
      const existingStyle = await webflow.getStyleByName(NEW_STYLE_NAME);
      if (existingStyle) {
        workingStyle = existingStyle;
      } else {
        workingStyle = webflow.createStyle(NEW_STYLE_NAME);
      }
      await setStyleProperties(workingStyle);
      try {
        await workingStyle.save();
      } catch (e) {
        console.error(e);
      }
      if (!existingStyle) {
        // Save the existing styles too
        el.setStyles([...currentStyles, workingStyle]); 
      }
    // Grab the cached style by reference and save new styles on it
    } else {
      await setStyleProperties(workingStyle);
      try {
        await workingStyle.save();
      } catch (e) {
        console.error(e);
      }
    }
    await el.save();
  }
}