namespace App\Http\Controllers;

use App\Models\Guest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use League\Csv\Writer;

class GuestController extends Controller
{
    // ... existing methods ...

    public function downloadPdf(Request $request)
    {
        $guests = json_decode($request->query('guests'), true);
        
        $pdf = PDF::loadView('exports.guests', [
            'guests' => $guests,
            'title' => 'Guests List',
            'date' => now()->format('F d, Y')
        ]);

        return $pdf->download('guests-' . now()->format('Y-m-d-His') . '.pdf');
    }

    public function downloadExcel(Request $request)
    {
        $guests = json_decode($request->query('guests'), true);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $headers = array_keys($guests[0]);
        foreach ($headers as $index => $header) {
            $sheet->setCellValueByColumnAndRow($index + 1, 1, $header);
        }

        // Set data
        foreach ($guests as $rowIndex => $guest) {
            foreach (array_values($guest) as $columnIndex => $value) {
                $sheet->setCellValueByColumnAndRow($columnIndex + 1, $rowIndex + 2, $value);
            }
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'guests-' . now()->format('Y-m-d-His') . '.xlsx';
        $path = storage_path('app/public/' . $filename);
        $writer->save($path);

        return response()->download($path, $filename)->deleteFileAfterSend();
    }

    public function downloadCsv(Request $request)
    {
        $guests = json_decode($request->query('guests'), true);

        $csv = Writer::createFromString('');
        
        // Add headers
        $csv->insertOne(array_keys($guests[0]));
        
        // Add rows
        foreach ($guests as $guest) {
            $csv->insertOne($guest);
        }

        $filename = 'guests-' . now()->format('Y-m-d-His') . '.csv';
        
        return response($csv->toString())
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"$filename\"");
    }

    public function viewPdf(Request $request)
    {
        $guests = json_decode($request->query('guests'), true);
        
        $pdf = PDF::loadView('exports.guests', [
            'guests' => $guests,
            'title' => 'Guests List',
            'date' => now()->format('F d, Y')
        ]);

        return $pdf->stream();
    }
} 