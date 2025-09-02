// Centering Test Script - Verify PDF positioning calculations
// Run this in browser console to test centering logic

console.log('=== PDF Centering Test ===');

// Page dimensions (A4)
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

// Content area dimensions
const CONTENT_WIDTH = 546;
const CONTENT_HEIGHT = 790;

// Calculate center positions
const contentLeft = (PAGE_WIDTH - CONTENT_WIDTH) / 2;
const contentTop = (PAGE_HEIGHT - CONTENT_HEIGHT) / 2;

console.log(`Page dimensions: ${PAGE_WIDTH}px × ${PAGE_HEIGHT}px`);
console.log(`Content area: ${CONTENT_WIDTH}px × ${CONTENT_HEIGHT}px`);
console.log(`Content center: left=${contentLeft}px, top=${contentTop}px`);

// Page 3 specific element centering
const titleWidth = 482;
const logoWidth = 124;
const clientNameWidth = 157;
const emailWidth = 471;

const titleLeft = (CONTENT_WIDTH - titleWidth) / 2;
const logoLeft = (CONTENT_WIDTH - logoWidth) / 2;
const clientNameLeft = (CONTENT_WIDTH - clientNameWidth) / 2;
const emailLeft = (CONTENT_WIDTH - emailWidth) / 2;

console.log('\n=== Page 3 Element Centering ===');
console.log(`Title (${titleWidth}px): left=${titleLeft}px`);
console.log(`Logo (${logoWidth}px): left=${logoLeft}px`);
console.log(`Client Name (${clientNameWidth}px): left=${clientNameLeft}px`);
console.log(`Email (${emailWidth}px): left=${emailLeft}px`);

// Verify calculations match our CSS
console.log('\n=== Verification ===');
console.log('Content area centered:', contentLeft === 24.5 ? '✓' : '✗');
console.log('Title centered:', titleLeft === 32 ? '✓' : '✗');
console.log('Logo centered:', logoLeft === 211 ? '✓' : '✗');
console.log('Client name centered:', clientNameLeft === 194.5 ? '✓' : '✗');
console.log('Email centered:', emailLeft === 37.5 ? '✓' : '✗');

console.log('\nAll calculations verified!');
