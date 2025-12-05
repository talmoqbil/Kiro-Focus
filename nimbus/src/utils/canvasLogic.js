/**
 * Canvas Logic Utilities
 * 
 * Implements grid and placement logic for the infrastructure canvas.
 * Canvas dimensions: 800x600 with 40x40 pixel grid cells.
 * 
 * **Validates: Requirements 5.2, 5.3**
 */

// Canvas constants
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const GRID_SIZE = 40; // pixels per cell

// Calculate grid dimensions
export const GRID_COLS = CANVAS_WIDTH / GRID_SIZE;  // 20 columns
export const GRID_ROWS = CANVAS_HEIGHT / GRID_SIZE; // 15 rows

/**
 * Snap a position to the nearest grid cell.
 * Uses rounding to find the closest grid intersection.
 * 
 * @param {Object} position - { x: number, y: number } in pixels
 * @returns {Object} - Snapped position { x: number, y: number }
 * 
 * **Validates: Requirements 5.2, 5.3**
 */
export function snapToGrid(position) {
  return {
    x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(position.y / GRID_SIZE) * GRID_SIZE
  };
}

/**
 * Check if a position is valid for placement.
 * Position must be within canvas bounds and not overlap existing components.
 * 
 * @param {Object} position - { x: number, y: number } in pixels
 * @param {Array} placedComponents - Array of placed components
 * @param {string} excludeId - Optional component ID to exclude (for moving)
 * @returns {boolean} - True if position is valid
 * 
 * **Validates: Requirements 5.2, 5.3**
 */
export function isValidPlacement(position, placedComponents, excludeId = null) {
  // Check canvas bounds (component is 80x80, so check if it fits)
  const componentSize = GRID_SIZE * 2; // Components are 2x2 grid cells
  
  if (position.x < 0 || position.x + componentSize > CANVAS_WIDTH) {
    return false;
  }
  if (position.y < 0 || position.y + componentSize > CANVAS_HEIGHT) {
    return false;
  }

  // Check for overlap with existing components
  for (const component of placedComponents) {
    if (excludeId && component.id === excludeId) {
      continue;
    }
    
    // Simple overlap check (components are 2x2 grid cells = 80x80 pixels)
    const overlap = !(
      position.x + componentSize <= component.position.x ||
      position.x >= component.position.x + componentSize ||
      position.y + componentSize <= component.position.y ||
      position.y >= component.position.y + componentSize
    );
    
    if (overlap) {
      return false;
    }
  }

  return true;
}

/**
 * Generate a unique component instance ID.
 * Format: {type}-{number} (e.g., "ec2-1", "ec2-2")
 * 
 * @param {string} type - Component type (e.g., "ec2", "s3")
 * @param {Array} placedComponents - Array of placed components
 * @returns {string} - Unique instance ID
 */
export function generateComponentId(type, placedComponents) {
  // Count existing components of this type
  const existingCount = placedComponents.filter(
    c => c.type.toLowerCase() === type.toLowerCase()
  ).length;
  
  return `${type.toLowerCase()}-${existingCount + 1}`;
}

/**
 * Find a valid position for auto-placement.
 * Scans grid from top-left to find first available spot.
 * 
 * @param {Array} placedComponents - Array of placed components
 * @returns {Object|null} - Valid position or null if canvas is full
 */
export function findAvailablePosition(placedComponents) {
  const componentSize = GRID_SIZE * 2;
  
  for (let y = 0; y <= CANVAS_HEIGHT - componentSize; y += GRID_SIZE) {
    for (let x = 0; x <= CANVAS_WIDTH - componentSize; x += GRID_SIZE) {
      const position = { x, y };
      if (isValidPlacement(position, placedComponents)) {
        return position;
      }
    }
  }
  
  return null; // Canvas is full
}

/**
 * Get grid cell coordinates from pixel position.
 * 
 * @param {Object} position - { x: number, y: number } in pixels
 * @returns {Object} - { col: number, row: number }
 */
export function getGridCell(position) {
  return {
    col: Math.floor(position.x / GRID_SIZE),
    row: Math.floor(position.y / GRID_SIZE)
  };
}

/**
 * Get pixel position from grid cell coordinates.
 * 
 * @param {number} col - Column index
 * @param {number} row - Row index
 * @returns {Object} - { x: number, y: number } in pixels
 */
export function getPixelPosition(col, row) {
  return {
    x: col * GRID_SIZE,
    y: row * GRID_SIZE
  };
}

/**
 * Check if canvas has any placed components.
 * 
 * @param {Array} placedComponents - Array of placed components
 * @returns {boolean} - True if canvas is empty
 * 
 * **Validates: Requirements 5.6**
 */
export function isCanvasEmpty(placedComponents) {
  return !placedComponents || placedComponents.length === 0;
}
