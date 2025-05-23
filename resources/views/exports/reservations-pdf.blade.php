<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }

        table {
            width: 95%;
            border-collapse: collapse;
            margin: 50px auto;
        }

        /* Zebra striping */
        tr:nth-of-type(odd) {
            background: #eee;
        }

        th {
            background: #3498db;
            color: white;
            font-weight: bold;
        }

        td, th {
            padding: 10px;
            border: 1px solid #ccc;
            text-align: left;
            font-size: 14px;
        }

        .header {
            width: 95%;
            margin: 0 auto;
            overflow: hidden;
        }

        .header-logo {
            width: 10%;
            float: left;
            margin-right: 20px;
        }

        .header-title {
            width: 50%;
            float: left;
        }

        .header-title h1 {
            margin: 0;
            color: #333;
        }

        .header-title p {
            margin: 5px 0;
            color: #666;
        }

        .status {
            padding: 5px 10px;
            border-radius: 4px;
            display: inline-block;
            font-size: 12px;
        }

        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }

        .status-confirmed {
            background-color: #dcfce7;
            color: #166534;
        }

        .status-cancelled {
            background-color: #fee2e2;
            color: #991b1b;
        }

        .status-checked_in {
            background-color: #dbeafe;
            color: #1e40af;
        }

        .status-checked_out {
            background-color: #f3f4f6;
            color: #374151;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-title">
            <h1>{{ $title }}</h1>
            <p>Generated on {{ $date }}</p>
        </div>
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
</body>
</html> 