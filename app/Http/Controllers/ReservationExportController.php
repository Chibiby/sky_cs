<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Writer\Csv;
use Barryvdh\DomPDF\Facade\Pdf;

class ReservationExportController extends Controller
{
    public function exportPDF(Request $request)
    {
        $reservations = $request->input('reservations');
        
        $pdf = PDF::loadView('exports.reservations-pdf', [
            'reservations' => $reservations,
            'title' => 'Reservations Report',
            'date' => date('Y-m-d H:i:s')
        ])->setPaper('a4', 'landscape');
        
        $filename = 'reservations-' . date('Y-m-d-His') . '.pdf';
        
        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => strlen($pdf->output())
        ]);
    }

    public function downloadPDF(Request $request)
    {
        $reservations = json_decode($request->query('reservations'), true);
        
        if (!$reservations) {
            abort(400, 'No reservation data provided');
        }
        
        $pdf = PDF::loadView('exports.reservations-pdf', [
            'reservations' => $reservations,
            'title' => 'Reservations Report',
            'date' => date('Y-m-d H:i:s')
        ])->setPaper('a4', 'landscape');
        
        $filename = 'reservations-' . date('Y-m-d-His') . '.pdf';
        
        return $pdf->download($filename);
    }

    public function exportExcel(Request $request)
    {
        $reservations = $request->input('reservations');
        
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set headers
        $headers = array_keys($reservations[0]);
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . '1', $header);
            $col++;
        }
        
        // Set data
        $row = 2;
        foreach ($reservations as $reservation) {
            $col = 'A';
            foreach ($reservation as $value) {
                $sheet->setCellValue($col . $row, $value);
                $col++;
            }
            $row++;
        }
        
        // Create Excel file
        $writer = new Xlsx($spreadsheet);
        $fileName = 'reservations-' . date('Y-m-d-His') . '.xlsx';
        
        // Save to temporary file and return response
        $tempFile = tempnam(sys_get_temp_dir(), $fileName);
        $writer->save($tempFile);
        
        return response()->download($tempFile, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    public function exportCSV(Request $request)
    {
        $reservations = $request->input('reservations');
        
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set headers
        $headers = array_keys($reservations[0]);
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . '1', $header);
            $col++;
        }
        
        // Set data
        $row = 2;
        foreach ($reservations as $reservation) {
            $col = 'A';
            foreach ($reservation as $value) {
                $sheet->setCellValue($col . $row, $value);
                $col++;
            }
            $row++;
        }
        
        // Create CSV file
        $writer = new Csv($spreadsheet);
        $fileName = 'reservations-' . date('Y-m-d-His') . '.csv';
        
        // Save to temporary file and return response
        $tempFile = tempnam(sys_get_temp_dir(), $fileName);
        $writer->save($tempFile);
        
        return response()->download($tempFile, $fileName, [
            'Content-Type' => 'text/csv',
        ])->deleteFileAfterSend(true);
    }

    public function print(Request $request)
    {
        try {
            $reservations = $request->input('reservations');
            
            if (!$reservations) {
                return response()->json(['error' => 'No reservations provided'], 400);
            }

            return view('exports.reservations-print', [
                'reservations' => $reservations,
                'title' => 'Reservations Print',
                'date' => date('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function downloadExcel(Request $request)
    {
        $reservations = json_decode($request->query('reservations'), true);
        
        if (!$reservations) {
            abort(400, 'No reservation data provided');
        }
        
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set column widths
        $sheet->getColumnDimension('A')->setWidth(30); // Guest Name
        $sheet->getColumnDimension('B')->setWidth(35); // Email
        $sheet->getColumnDimension('C')->setWidth(15); // Phone
        $sheet->getColumnDimension('D')->setWidth(15); // Room Type
        $sheet->getColumnDimension('E')->setWidth(15); // Number of Guests
        $sheet->getColumnDimension('F')->setWidth(15); // Check-in Date
        $sheet->getColumnDimension('G')->setWidth(15); // Check-out Date
        $sheet->getColumnDimension('H')->setWidth(15); // Status
        $sheet->getColumnDimension('I')->setWidth(40); // Special Requests

        // Style the header row
        $headerStyle = [
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '3498DB'],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
        ];

        // Set row height
        $sheet->getRowDimension(1)->setRowHeight(25);
        
        // Set headers
        $headers = array_keys($reservations[0]);
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . '1', $header);
            $sheet->getStyle($col . '1')->applyFromArray($headerStyle);
            $col++;
        }
        
        // Style for data rows
        $dataStyle = [
            'alignment' => [
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
        ];
        
        // Set data
        $row = 2;
        foreach ($reservations as $reservation) {
            // Set row height for data rows
            $sheet->getRowDimension($row)->setRowHeight(20);
            
            $col = 'A';
            foreach ($reservation as $value) {
                $cell = $col . $row;
                $sheet->setCellValue($cell, $value);
                $sheet->getStyle($cell)->applyFromArray($dataStyle);
                
                // Add borders to the cell
                $sheet->getStyle($cell)->getBorders()->getAllBorders()->setBorderStyle(
                    \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN
                );
                
                // If this is a status cell, add background color
                if ($col === 'H') { // Assuming 'H' is the status column
                    $backgroundColor = $this->getStatusBackgroundColor(strtolower($value));
                    $sheet->getStyle($cell)->getFill()->setFillType(
                        \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID
                    )->setStartColor(new \PhpOffice\PhpSpreadsheet\Style\Color($backgroundColor));
                }
                
                $col++;
            }
            $row++;
        }
        
        // Create Excel file
        $writer = new Xlsx($spreadsheet);
        $fileName = 'reservations-' . date('Y-m-d-His') . '.xlsx';
        
        // Save to temporary file and return response
        $tempFile = tempnam(sys_get_temp_dir(), $fileName);
        $writer->save($tempFile);
        
        return response()->download($tempFile, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    private function getStatusBackgroundColor($status)
    {
        return match ($status) {
            'pending' => 'FEF3C7',    // Light yellow
            'confirmed' => 'DCFCE7',   // Light green
            'cancelled' => 'FEE2E2',   // Light red
            'checked_in' => 'DBEAFE',  // Light blue
            'checked_out' => 'F3F4F6', // Light gray
            default => 'FFFFFF',       // White
        };
    }

    public function downloadCSV(Request $request)
    {
        $reservations = json_decode($request->query('reservations'), true);
        
        if (!$reservations) {
            abort(400, 'No reservation data provided');
        }
        
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set headers
        $headers = array_keys($reservations[0]);
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . '1', $header);
            $col++;
        }
        
        // Set data
        $row = 2;
        foreach ($reservations as $reservation) {
            $col = 'A';
            foreach ($reservation as $value) {
                $sheet->setCellValue($col . $row, $value);
                $col++;
            }
            $row++;
        }
        
        // Create CSV file
        $writer = new Csv($spreadsheet);
        $fileName = 'reservations-' . date('Y-m-d-His') . '.csv';
        
        // Save to temporary file and return response
        $tempFile = tempnam(sys_get_temp_dir(), $fileName);
        $writer->save($tempFile);
        
        return response()->download($tempFile, $fileName, [
            'Content-Type' => 'text/csv',
        ])->deleteFileAfterSend(true);
    }

    public function viewPDF(Request $request)
    {
        try {
            $reservations = json_decode($request->query('reservations'), true);
            
            if (!$reservations) {
                return response()->json(['error' => 'No reservations provided'], 400);
            }

            $pdf = PDF::loadView('exports.reservations-pdf', [
                'reservations' => $reservations,
                'title' => 'Reservations Report',
                'date' => date('Y-m-d H:i:s')
            ])->setPaper('a4', 'landscape');

            return $pdf->stream('reservations.pdf');
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
} 