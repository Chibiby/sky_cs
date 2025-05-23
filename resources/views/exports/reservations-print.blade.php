<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @media print {
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                page-break-inside: auto;
            }
            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f4f4f4 !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                margin: 0;
                color: #333;
            }
            .header p {
                margin: 5px 0;
                color: #666;
            }
            .status {
                padding: 5px 10px;
                border-radius: 4px;
                display: inline-block;
            }
            .status-pending { 
                background-color: #fef3c7 !important;
                color: #92400e !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            .status-confirmed { 
                background-color: #dcfce7 !important;
                color: #166534 !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            .status-cancelled { 
                background-color: #fee2e2 !important;
                color: #991b1b !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            .status-checked_in { 
                background-color: #dbeafe !important;
                color: #1e40af !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            .status-checked_out { 
                background-color: #f3f4f6 !important;
                color: #374151 !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Generated on {{ $date }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Guest Name</th>
                <th>Contact</th>
                <th>Room Type</th>
                <th>Guests</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($reservations as $reservation)
                <tr>
                    <td>{{ $reservation['Guest Name'] }}</td>
                    <td>
                        {{ $reservation['Email'] }}<br>
                        {{ $reservation['Phone'] }}
                    </td>
                    <td>{{ $reservation['Room Type'] }}</td>
                    <td>{{ $reservation['Number of Guests'] }}</td>
                    <td>{{ $reservation['Check-in Date'] }}</td>
                    <td>{{ $reservation['Check-out Date'] }}</td>
                    <td>
                        <div class="status status-{{ strtolower($reservation['Status']) }}">
                            {{ $reservation['Status'] }}
                        </div>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <script>
        // Automatically trigger print when the page loads
        window.onload = function() {
            // Small delay to ensure styles are loaded
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html> 