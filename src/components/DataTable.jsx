import React, { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Modern DataTable component with pagination
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {Array} props.columns - Array of column definitions: [{ key, label, render?, className? }]
 * @param {number} props.initialPageSize - Initial number of records per page (default: 10)
 * @param {Function} props.onRowClick - Optional callback when row is clicked
 * @param {string} props.emptyMessage - Message to show when no data
 * @param {Array} props.pageSizeOptions - Available page size options (default: [5, 10, 25, 50])
 */
export default function DataTable({
	data = [],
	columns = [],
	initialPageSize = 5,
	onRowClick,
	emptyMessage = 'No data available',
	pageSizeOptions = [5, 10, 25, 50],
}) {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(initialPageSize);

	// Reset to page 1 when page size changes
	const handlePageSizeChange = (newSize) => {
		setPageSize(Number(newSize));
		setCurrentPage(1);
	};

	// Calculate pagination
	const totalPages = Math.ceil(data.length / pageSize);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const currentData = useMemo(
		() => data.slice(startIndex, endIndex),
		[data, startIndex, endIndex]
	);

	// Reset to page 1 if current page exceeds total pages
	React.useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(1);
		}
	}, [currentPage, totalPages]);

	// Generate page numbers to display
	const pageNumbers = useMemo(() => {
		const pages = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			// Show all pages if total is less than max visible
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show smart pagination with ellipsis
			if (currentPage <= 3) {
				// Show first 3 pages, ellipsis, and last page
				pages.push(1, 2, 3, '...', totalPages);
			} else if (currentPage >= totalPages - 2) {
				// Show first page, ellipsis, and last 3 pages
				pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
			} else {
				// Show first page, ellipsis, current page +/- 1, ellipsis, last page
				pages.push(
					1,
					'...',
					currentPage - 1,
					currentPage,
					currentPage + 1,
					'...',
					totalPages
				);
			}
		}
		return pages;
	}, [currentPage, totalPages]);

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const goToPrevious = () => goToPage(currentPage - 1);
	const goToNext = () => goToPage(currentPage + 1);

	if (data.length === 0) {
		return (
			<div className="text-center py-12 text-brand-blue/60 bg-white rounded-lg border border-brand-silver">
				{emptyMessage}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Table */}
			<div className="overflow-x-auto rounded-lg border border-brand-silver bg-white shadow-sm">
				<table className="w-full">
					<thead>
						<tr className="bg-gradient-to-r from-brand-ice to-brand-pearl">
							{columns.map((col, idx) => (
								<th
									key={idx}
									className={`p-4 text-left font-semibold text-brand-dark border-b border-brand-silver whitespace-nowrap ${
										col.className || ''
									}`}
								>
									{col.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{currentData.map((row, rowIdx) => (
							<tr
								key={rowIdx}
								onClick={() => onRowClick?.(row)}
								className={`
                                    border-b border-brand-silver last:border-b-0
                                    hover:bg-brand-ice transition-colors
                                    ${onRowClick ? 'cursor-pointer' : ''}
                                `}
							>
								{columns.map((col, colIdx) => (
									<td
										key={colIdx}
										className={`p-4 text-brand-dark ${col.className || ''}`}
									>
										{col.render ? col.render(row[col.key], row) : row[col.key]}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination Controls */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white rounded-lg border border-brand-silver shadow-sm">
				{/* Page info */}
				<div className="text-sm text-brand-blue/80 whitespace-nowrap">
					Showing{' '}
					<span className="font-semibold text-brand-dark">
						{startIndex + 1}
					</span>{' '}
					to{' '}
					<span className="font-semibold text-brand-dark">
						{Math.min(endIndex, data.length)}
					</span>{' '}
					of{' '}
					<span className="font-semibold text-brand-dark">{data.length}</span>{' '}
					records
				</div>

				{/* Page numbers */}
				{totalPages > 1 && (
					<div className="flex items-center gap-2">
						{/* Previous button */}
						<button
							onClick={goToPrevious}
							disabled={currentPage === 1}
							className="p-2 rounded-lg border border-brand-silver bg-white hover:bg-brand-ice disabled:opacity-50 disabled:cursor-not-allowed transition-all"
							aria-label="Previous page"
							title="Previous page"
						>
							<FaChevronLeft className="w-4 h-4 text-brand-blue" />
						</button>

						{/* Page numbers */}
						<div className="flex items-center gap-1">
							{pageNumbers.map((pageNum, idx) => {
								if (pageNum === '...') {
									return (
										<span
											key={`ellipsis-${idx}`}
											className="px-3 py-2 text-brand-blue/60"
										>
											...
										</span>
									);
								}

								return (
									<button
										key={pageNum}
										onClick={() => goToPage(pageNum)}
										className={`
                                            px-4 py-2 rounded-lg font-medium transition-all min-w-[40px]
                                            ${
																							currentPage === pageNum
																								? 'bg-blue-gradient text-white shadow-lg'
																								: 'bg-white border border-brand-silver text-brand-blue hover:bg-brand-ice'
																						}
                                        `}
									>
										{pageNum}
									</button>
								);
							})}
						</div>

						{/* Next button */}
						<button
							onClick={goToNext}
							disabled={currentPage === totalPages}
							className="p-2 rounded-lg border border-brand-silver bg-white hover:bg-brand-ice disabled:opacity-50 disabled:cursor-not-allowed transition-all"
							aria-label="Next page"
							title="Next page"
						>
							<FaChevronRight className="w-4 h-4 text-brand-blue" />
						</button>
					</div>
				)}

				{/* Page size selector */}
				<div className="flex items-center gap-2 text-sm text-brand-blue/80 whitespace-nowrap">
					<span>Rows per page:</span>
					<select
						value={pageSize}
						onChange={(e) => handlePageSizeChange(e.target.value)}
						className="px-3 py-2 rounded-lg border border-brand-silver bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light transition"
					>
						{pageSizeOptions.map((size) => (
							<option key={size} value={size}>
								{size}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
}
