// Validate Australian Business Number (ABN)
export default function validateABN(abn) {
	// Remove all spaces and non-digit characters
	const cleanABN = abn.replace(/\s/g, '');

	// Check if ABN is 11 digits
	if (!/^\d{11}$/.test(cleanABN)) {
		return false;
	}

	// Apply weighting to digits and checksum
	const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
	let sum = 0;

	// Subtract 1 from the first digit
	const digits = cleanABN.split('').map(Number);
	digits[0] -= 1;

	// Calculate weighted sum
	for (let i = 0; i < 11; i++) {
		sum += digits[i] * weights[i];
	}

	// Valid ABN has a sum divisible by 89
	return sum % 89 === 0;
}

/**
 * Creates a handler for numeric-only input fields (allows only digits, no spaces)
 * Use this for fields like user counts, IDs, etc.
 * @param {Function} setForm - The state setter function for the form
 * @returns {Function} Event handler function
 */
export function createNumericInputHandler(setForm) {
	return (e) => {
		const { name, value } = e.target;
		// Only allow digits
		const numericValue = value.replace(/\D/g, '');
		setForm((prev) => ({ ...prev, [name]: numericValue }));
	};
}

/**
 * Validate email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} True if valid email format, false otherwise
 */
export function validateEmail(email) {
	if (!email) return true; // Empty email is valid (optional field)

	// RFC 5322 compliant email regex (simplified)
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return emailRegex.test(email.trim());
}

/**
 * Smooth scroll to a target position with custom easing
 * @param {number} targetPosition - The Y position to scroll to
 * @param {number} duration - Duration of the animation in milliseconds (default: 1000)
 * @param {number} offset - Additional offset from the target position (default: 80)
 */
export function smoothScrollTo(targetPosition, duration = 1000, offset = 80) {
	const startPosition = window.pageYOffset;
	const distance = targetPosition - startPosition - offset;
	let startTime = null;

	const easeInOutCubic = (t) => {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	};

	const animation = (currentTime) => {
		if (startTime === null) startTime = currentTime;
		const timeElapsed = currentTime - startTime;
		const progress = Math.min(timeElapsed / duration, 1);
		const ease = easeInOutCubic(progress);

		window.scrollTo(0, startPosition + distance * ease);

		if (timeElapsed < duration) {
			requestAnimationFrame(animation);
		}
	};

	requestAnimationFrame(animation);
}

/**
 * Smooth scroll to an element with custom easing
 * @param {HTMLElement} element - The element to scroll to
 * @param {number} duration - Duration of the animation in milliseconds (default: 1000)
 * @param {number} offset - Additional offset from the target position (default: 80)
 */
export function smoothScrollToElement(element, duration = 1000, offset = 80) {
	if (!element) return;

	const elementPosition = element.getBoundingClientRect().top;
	const targetPosition = elementPosition + window.pageYOffset;

	smoothScrollTo(targetPosition, duration, offset);
}
