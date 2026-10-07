/**
 * Form animation utilities for validation feedback
 * Provides shake animation for errors and success animations for valid states
 */

/**
 * Triggers a shake animation on an element (for validation errors)
 * @param elementId - The ID of the element to shake
 */
export function triggerShake(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.classList.remove("animate-shake");
  // Force reflow to restart animation
  void element.offsetWidth;
  element.classList.add("animate-shake");

  // Remove class after animation completes
  setTimeout(() => {
    element.classList.remove("animate-shake");
  }, 320);
}

/**
 * Triggers a scale-in animation on an element (for success states)
 * @param elementId - The ID of the element to animate
 */
export function triggerScaleIn(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.classList.remove("animate-scale-in");
  void element.offsetWidth;
  element.classList.add("animate-scale-in");
}

/**
 * Adds visual feedback to form field on error
 * @param fieldId - The ID of the form field
 */
export function showFieldError(fieldId: string) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.classList.add("border-danger", "animate-shake");
  setTimeout(() => {
    field.classList.remove("animate-shake");
  }, 320);
}

/**
 * Removes error styling from form field
 * @param fieldId - The ID of the form field
 */
export function clearFieldError(fieldId: string) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.classList.remove("border-danger");
}
