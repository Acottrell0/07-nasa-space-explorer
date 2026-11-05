// Paste your NASA API key between the quotation marks.
// You can get a free key at https://api.nasa.gov/
const NASA_API_KEY = '7mNHhbpgJqWnRBCMcpGDHmthnHdTQCjcCmGLjCdQ';

// Find the page elements we will use.
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModalButton');
const modalImage = document.getElementById('modalImage');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalExplanation = document.getElementById('modalExplanation');

setupDateInputs(startInput, endInput);

async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate || startDate > endDate) {
		gallery.innerHTML = '<p class="message error-message">Please choose a valid date range.</p>';
		return;
	}

	gallery.innerHTML = '<p class="message loading-message">Loading space photos...</p>';
	getImagesButton.disabled = true;

	const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;

	try {
		const response = await fetch(apiUrl);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.msg || 'NASA could not return the images.');
		}

		const images = data.filter((item) => item.media_type === 'image' && (item.hdurl || item.url));
		displayGallery(images);
	} catch (error) {
		gallery.innerHTML = `<p class="message error-message">${error.message}</p>`;
	} finally {
		getImagesButton.disabled = false;
	}
}

function displayGallery(images) {
	if (images.length === 0) {
		gallery.innerHTML = '<p class="message">No image results were found for those dates.</p>';
		return;
	}

	gallery.innerHTML = images.map((image, index) => `
		<button class="gallery-item" type="button" data-image-index="${index}">
			<img src="${image.hdurl || image.url}" alt="${image.title}" />
			<span class="gallery-item-date">${image.date}</span>
			<strong>${image.title}</strong>
		</button>
	`).join('');

	gallery.querySelectorAll('.gallery-item').forEach((item, index) => {
		item.addEventListener('click', () => openModal(images[index]));
	});
}

function openModal(image) {
	modalImage.src = image.hdurl || image.url;
	modalImage.alt = image.title;
	modalDate.textContent = image.date;
	modalTitle.textContent = image.title;
	modalExplanation.textContent = image.explanation;
	imageModal.classList.add('is-open');
	imageModal.setAttribute('aria-hidden', 'false');
	closeModalButton.focus();
}

function closeModal() {
	imageModal.classList.remove('is-open');
	imageModal.setAttribute('aria-hidden', 'true');
}

getImagesButton.addEventListener('click', getSpaceImages);
closeModalButton.addEventListener('click', closeModal);
imageModal.addEventListener('click', (event) => {
	if (event.target === imageModal) {
		closeModal();
	}
});
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && imageModal.classList.contains('is-open')) {
		closeModal();
	}
});

// Load the default date range as soon as the page opens.
getSpaceImages();
