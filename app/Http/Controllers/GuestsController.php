<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Guest;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use League\Csv\Writer;

class GuestsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('guests/index', [
            'guests' => Guest::all(),
        ]);
    }

    public function checkedIn(): Response
    {
        return Inertia::render('guests/checked-in', [
            'guests' => Guest::where('status', 'checked_in')->get(),
        ]);
    }

    public function history(): Response
    {
        $guests = Guest::orderBy('created_at', 'desc')->get();
        
        return Inertia::render('guests/history', [
            'guests' => $guests
        ]);
    }

    public function vip(): Response
    {
        return Inertia::render('guests/vip', [
            'guests' => Guest::where('is_vip', true)->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('guests/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Implement guest creation logic
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Implement guest details view
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Guest $guest): Response
    {
        return Inertia::render('guests/edit', [
            'guest' => $guest
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Guest $guest)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone_number' => 'required|string|max:20',
            'address' => 'required|string|max:255',
        ]);

        $guest->update($validated);

        return redirect()->route('guests.manage')->with('success', 'Guest updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Guest $guest)
    {
        $guest->delete();
        return redirect()->route('guests.manage')->with('success', 'Guest deleted successfully');
    }

    public function manage(): Response
    {
        return Inertia::render('guests/manage', [
            'guests' => Guest::all()
        ]);
    }

    public function downloadPdf(Request $request)
    {
        $guests = json_decode($request->query('guests'), true);
        $template = $request->query('template', 'guests');
        
        $pdf = PDF::loadView('exports.' . $template, [
            'guests' => $guests,
            'title' => $template === 'guests-history' ? 'Guests History' : 'Guests List',
            'date' => now()->format('F d, Y')
        ]);

        $filename = $template === 'guests-history' 
            ? 'guests-history-' . now()->format('Y-m-d-His') . '.pdf'
            : 'guests-' . now()->format('Y-m-d-His') . '.pdf';

        return $pdf->download($filename);
    }

    public function downloadExcel(Request $request)
    {
        $guests = json_decode($request->query('guests'), true);
        $template = $request->query('template', 'guests');

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $headers = array_keys($guests[0]);
        foreach ($headers as $index => $header) {
            $sheet->setCellValue(
                \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1) . '1',
                $header
            );
        }

        // Set data
        foreach ($guests as $rowIndex => $guest) {
            $row = $rowIndex + 2; // Start from row 2 (after headers)
            foreach (array_values($guest) as $columnIndex => $value) {
                $sheet->setCellValue(
                    \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1) . $row,
                    $value
                );
            }
        }

        // Auto-size columns
        foreach (range(1, count($headers)) as $col) {
            $sheet->getColumnDimension(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col))->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $filename = $template === 'guests-history' 
            ? 'guests-history-' . now()->format('Y-m-d-His') . '.xlsx'
            : 'guests-' . now()->format('Y-m-d-His') . '.xlsx';
        $path = storage_path('app/public/' . $filename);
        $writer->save($path);

        return response()->download($path, $filename)->deleteFileAfterSend();
    }

    public function downloadCsv(Request $request)
    {
        $guests = json_decode($request->query('guests'), true);
        $template = $request->query('template', 'guests');

        $csv = Writer::createFromString('');
        
        // Add headers
        $csv->insertOne(array_keys($guests[0]));
        
        // Add rows
        foreach ($guests as $guest) {
            $csv->insertOne($guest);
        }

        $filename = $template === 'guests-history' 
            ? 'guests-history-' . now()->format('Y-m-d-His') . '.csv'
            : 'guests-' . now()->format('Y-m-d-His') . '.csv';
        
        return response($csv->toString())
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"$filename\"");
    }

    public function viewPdf(Request $request)
    {
        $guests = json_decode($request->query('guests'), true);
        $template = $request->query('template', 'guests');
        
        $pdf = PDF::loadView('exports.' . $template, [
            'guests' => $guests,
            'title' => $template === 'guests-history' ? 'Guests History' : 'Guests List',
            'date' => now()->format('F d, Y')
        ]);

        return $pdf->stream();
    }
}
