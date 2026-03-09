export const motionTokens = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
};

/** CSS class names for the keyframe animations defined in globals.css */
export const motionClasses = {
  pageEnter: "page-enter",
  cardStagger: "card-stagger",
  breathingCircle: "breathing-circle",
} as const;
