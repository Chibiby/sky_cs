<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Illuminate\Validation\Rules;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Handle search
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('role', 'like', "%{$search}%");
            });
        }

        // Handle role filter
        if ($request->has('role') && $request->get('role') !== 'all') {
            $query->where('role', $request->get('role'));
        }

        $users = $query->paginate(10);

        // Transform the users collection to include first_name and last_name
        $users->through(function ($user) {
            $nameParts = explode(' ', $user->name, 2);
            $user->first_name = $nameParts[0] ?? '';
            $user->last_name = $nameParts[1] ?? '';
            return $user;
        });

        return Inertia::render('Users/manage', [
            'users' => $users,
            'filters' => [
                'search' => $request->get('search', ''),
                'role' => $request->get('role', 'all'),
            ],
        ]);
    }

    public function create()
    {
        $roles = [
            ['id' => 'manager', 'name' => 'Manager'],
            ['id' => 'staff', 'name' => 'Staff']
        ];

        return Inertia::render('Users/Create', [
            'roles' => $roles
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8'],
                'role' => ['required', 'string', 'in:manager,staff'],
            ]);

            $user = User::create([
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'email_verified_at' => now(),
            ]);

            return redirect()->route('users.index')
                ->with('success', 'User created successfully');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Error creating user: ' . $e->getMessage());
        }
    }

    public function edit(User $user)
    {
        // Add first and last name for the form
        $nameParts = explode(' ', $user->name, 2);
        $user->first_name = $nameParts[0] ?? '';
        $user->last_name = $nameParts[1] ?? '';
        
        return Inertia::render('Users/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|in:manager,staff',
            'password' => $request->filled('password') ? ['required', 'confirmed', 'min:8'] : '',
        ]);

        // Update user data
        $userData = [
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);

        return redirect()->route('users.manage')->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully');
    }

    public function sendResetLink(User $user)
    {
        Password::sendResetLink(['email' => $user->email]);
        return back()->with('success', 'Password reset link sent successfully');
    }

    public function changeRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|string|in:admin,staff,guest'
        ]);

        $user->update(['role' => $validated['role']]);
        return back()->with('success', 'User role updated successfully');
    }

    public function bulkDestroy(Request $request)
    {
        try {
            $validated = $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'exists:users,id'
            ]);

            User::whereIn('id', $validated['ids'])->delete();

            return response()->json([
                'message' => 'Users deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error deleting users: ' . $e->getMessage()
            ], 500);
        }
    }
} 