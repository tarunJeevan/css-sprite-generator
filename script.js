function processImages() {
    const imageContainer = document.getElementById("imageContainer");
    const images = Array.from(imageContainer.getElementsByTagName("img"));
    const layout = document.querySelector('input[name="layout"]:checked').value;
    const margin = 5;

    let spriteWidth = 0;
    let spriteHeight = 0;

    if (layout === "vertical") {
        spriteWidth = Math.max(...images.map(img => img.width));
        spriteHeight = images.reduce((sum, img) => sum + img.height + margin, 0) - margin;
    } else if (layout === "horizontal") {
        spriteWidth = images.reduce((sum, img) => sum + img.height + margin, 0) - margin;
        spriteHeight = Math.max(...images.map(img => img.width));
    } else if (layout === "grid") {
        const numCols = Math.ceil(Math.sqrt(images.length));
        const numRows = Math.ceil(images.length / numCols);

        spriteWidth = numCols * Math.max(...images.map(img => img.width)) + (numCols - 1) * margin;
        spriteHeight = numRows * Math.max(...images.map(img => img.height)) + (numCols - 1) * margin;
    }
    return { images, spriteWidth, spriteHeight, margin, layout };
}

function generateSprite(download) {
    const { images, spriteWidth, spriteHeight, margin, layout } = processImages();
    const canvas = document.getElementById("spriteCanvas");
    const context = canvas.getContext("2d");
    const cssOutput = document.getElementById("cssOutput");

    if (images.length === 0) {
        alert("Please add some images");
        return;
    }

    canvas.width = spriteWidth;
    canvas.height = spriteHeight;
    canvas.style.display = "block";

    let css = "";
    let offsetX = 0;
    let offsetY = 0;
    let rowHeight = 0;

    images.forEach((img, index) => {
        if (layout === "vertical") {
            context.drawImage(img, 0, offsetY);
            css += `.sprite-${index} {
                width: ${img.width}px;
                height: ${img.height}px;
                background: url('sprite.png') 0px -${offsetY}px;
            }\n`;
            offsetY += img.height + margin;
        } else if (layout === "horizontal") {
            context.drawImage(img, offsetX, 0);
            css += `.sprite-${index} {
                width: ${img.width}px;
                height: ${img.height}px;
                background: url('sprite.png') 0px -${offsetX}px;
            }\n`;
            offsetX += img.width + margin;
        } else if (layout === "grid") {
            if (offsetX + img.width > spriteWidth) {
                offsetX = 0;
                offsetY += rowHeight + margin;
                rowHeight = 0;
            }
            context.drawImage(img, offsetX, offsetY);
            css += `.sprite-${index} {
                width: ${img.width}px;
                height: ${img.height}px;
                background: url('sprite.png') 0px -${offsetX}px -${offsetY}px;
            }\n`;
            rowHeight = Math.max(rowHeight, img.height);
            offsetX += img.width + margin;
        }
    });

    cssOutput.value = css;

    if (download) {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "sprite.png";
            link.click();
        });
    }
}

document.getElementById("addImages").addEventListener("click", () => {
    const imageInput = document.getElementById("imageInput");
    const imageContainer = document.getElementById("imageContainer");

    for (let file of imageInput.files) {
        const image = new Image();
        const reader = new FileReader();

        reader.onload = e => {
            image.src = e.target.result;
            imageContainer.appendChild(image);
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById("previewSprite").addEventListener("click", () => {
    generateSprite(false);
});

document.getElementById("downloadSprite").addEventListener("click", () => {
    generateSprite(true);
});