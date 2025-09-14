# SumoQuote v2 - Chimney Service Quote Generator

A comprehensive React-based application for generating professional chimney service quotes and reports. This application streamlines the process of creating detailed service reports, repair estimates, and documentation for chimney service companies.

## Features

### Multi-Step Quote Generation
- **Step 1**: Manual Entry - Client information and service details
- **Step 2**: Static Content - Company credentials and insurance information
- **Step 3**: Service Report - Detailed service information and timeline
- **Step 4**: Chimney Type - Masonry or prefabricated chimney selection
- **Step 5**: Invoice Management - Dynamic invoice generation with multiple pages
- **Step 6**: Project Images - Image selection and management (max 4 images)
- **Step 7**: Repair Estimate - Comprehensive repair cost estimation
- **Step 8**: Inspection Images - Additional inspection image display
- **Step 9**: Documentation - Chimney-specific documentation (3-4 parts based on chimney type)
- **Step 10**: Final Steps - Final report generation and review

### Key Capabilities
- **Data Scraping**: Automated data extraction from various sources
- **Image Management**: Upload, crop, and organize service images
- **PDF Generation**: Professional PDF report generation with proper formatting
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Real-time Preview**: Live preview of all steps before PDF generation
- **Multi-page Support**: Dynamic page generation for invoices and documentation

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **html2canvas** for PDF generation
- **jsPDF** for PDF creation
- **React Router** for navigation
- **Custom Components** for specialized functionality

## Project Structure

```
src/
├── components/
│   ├── Step1.tsx              # Manual Entry
│   ├── Step2.tsx              # Static Content
│   ├── Step3.tsx              # Service Report
│   ├── Step3.css              # Service Report styles
│   ├── Step4.tsx              # Chimney Type
│   ├── Step4.module.css       # Chimney Type styles
│   ├── Step5.tsx              # Invoice Management
│   ├── Step5.module.css       # Invoice styles
│   ├── Step6.tsx              # Project Images
│   ├── Step6.module.css       # Image selection styles
│   ├── Step7.tsx              # Repair Estimate
│   ├── Step7.module.css       # Repair estimate styles
│   ├── Step8.tsx              # Inspection Images
│   ├── Step9-part1.tsx        # Documentation Part 1
│   ├── Step9-part2.tsx        # Documentation Part 2
│   ├── Step9-part3.tsx        # Documentation Part 3
│   ├── Step9-part4.tsx        # Documentation Part 4 (Prefabricated only)
│   ├── Step10Part1.tsx        # Final Steps Part 1
│   ├── Step10Part2.tsx        # Final Steps Part 2
│   ├── MultiStepForm.tsx      # Main application logic
│   ├── DataScraper.tsx        # Data extraction component
│   ├── ImageCropper.tsx       # Image editing component
│   └── FormInputs.tsx         # Reusable form components
├── App.tsx                    # Main application component
├── App.css                    # Global styles
├── index.tsx                  # Application entry point
└── index.css                  # Base styles
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sumoquote-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

### `npm start`
Runs the app in development mode with hot reloading.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder with optimized performance.

### `npm run eject`
**Note: This is a one-way operation!**
Ejects from Create React App to get full control over build configuration.

## Usage

### Basic Workflow

1. **Data Extraction**: Start by scraping client data or manually entering information
2. **Step Navigation**: Use the step-by-step interface to complete all required information
3. **Image Management**: Upload and organize service images (maximum 4 for project images)
4. **Invoice Creation**: Generate detailed invoices with line items and pricing
5. **Repair Estimates**: Create comprehensive repair cost estimates
6. **Documentation**: Review chimney-specific documentation based on chimney type
7. **PDF Generation**: Generate professional PDF reports for client delivery

### PDF Generation Features

- **Multi-page Support**: Automatic page generation based on content
- **Responsive Layout**: Proper scaling for different screen sizes
- **Image Optimization**: Compressed images for optimal file size
- **Professional Formatting**: Consistent styling and layout across all pages
- **Chimney Type Support**: Different documentation for masonry vs prefabricated chimneys

### Image Management

- **Upload Support**: Drag-and-drop or click to upload images
- **Crop Functionality**: Built-in image cropping tool
- **Format Support**: JPEG, PNG, and WebP formats
- **Size Optimization**: Automatic compression for PDF generation
- **Preview Mode**: Real-time preview of selected images

## Configuration

### Environment Variables
Create a `.env` file in the root directory for any environment-specific configurations:

```env
REACT_APP_API_URL=your_api_url_here
REACT_APP_PDF_QUALITY=0.78
```

### Customization
- **Styling**: Modify Tailwind CSS classes or add custom CSS
- **Components**: Extend or modify existing components in the `src/components` directory
- **PDF Settings**: Adjust PDF generation parameters in `MultiStepForm.tsx`

## Recent Updates

### v2.0.0 - Major Refactoring
- **Renamed Components**: All "Page" components renamed to "Step" for consistency
- **Fixed PDF Generation**: Resolved positioning and layout issues in PDF output
- **Improved Navigation**: Updated step labels and navigation flow
- **Enhanced Styling**: Consistent color scheme and improved UI/UX
- **Code Organization**: Better component structure and file organization

### PDF Generation Fixes
- Fixed content positioning issues in Steps 9 and 10
- Resolved image sizing inconsistencies between preview and PDF modes
- Improved conditional rendering for chimney type-specific content
- Enhanced overall PDF layout and formatting

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This application is specifically designed for chimney service companies and includes industry-specific terminology and workflows. Customization may be required for other service industries.