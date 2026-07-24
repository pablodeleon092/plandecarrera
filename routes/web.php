<?php
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\DictaController;
use App\Http\Controllers\CargoController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CarreraController;
use App\Http\Controllers\MateriaController;
use App\Http\Controllers\ComisionController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HorarioController;
use Inertia\Inertia;

Route::get('/', [DashboardController::class, 'home'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard-coordinador', [DashboardController::class, 'dashboardCoordinador'])
        ->name('dashboard.coordinador');
    route::get('/dashboard-admin', [DashboardController::class, 'dashboardAdmin'])
        ->name('dashboard.admin');
    
    // aca agregar  las rutas para los otros roles más adelante:
    // Route::get('/dashboard-admin', [DashboardController::class, 'dashboardAdmin'])->name('dashboard.admin');
});





Route::middleware('auth')->group(function () {
    #UsuariusCrud
    Route::middleware('can:index,App\Models\User')->group(function () {
        Route::get('users/create/carreras', [UserController::class, 'createCoordinatorCarreras'])
            ->name('users.coordinator-carreras.create');
        Route::post('users/create/carreras', [UserController::class, 'storeCoordinatorWithCarreras'])
            ->name('users.coordinator-carreras.store');
        Route::resource('users', UserController::class);
        Route::patch('users/{user}/password', [UserController::class, 'updatePassword'])->name('users.password.update');
        Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggleStatus');
        Route::get('users/{user}/carreras', [UserController::class, 'carrerasCoordinador'])->name('coordinadores.carreras.edit');
        Route::patch('users/{user}/carreras', [UserController::class, 'updateCarrerasCoordinador'])->name('coordinadores.carreras.update');
    });


    Route::get('/profile/view', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Rutas para la gestión de Docentes
    //Route::get('/docentes/exportar', [DocenteController::class, 'exportar'])->name('docentes.exportar');
    Route::get('/exportar/{tipo}', [ReportController::class, 'exportar'])->name('exportar.pdf');
    Route::resource('docentes', DocenteController::class);
    Route::resource('cargos', CargoController::class)->only(['store']);
    Route::get('docentes/{docente}/cargo/create', [DocenteController::class, 'createCargo'])->name('docentes.cargo.create');
    Route::post('docentes/{docente}/cargo', [DocenteController::class, 'addCargo'])->name('docentes.cargo.store');
    Route::get('docentes/{docente}/cargos/eliminar', [DocenteController::class, 'eliminarCargos'])->name('docentes.cargos.eliminar');
    Route::delete('docentes/{docente}/cargos', [DocenteController::class, 'destroyCargos'])->name('docentes.cargos.destroy');
    Route::patch('docentes/{docente}/toggle-status', [DocenteController::class, 'toggleStatus'])->name('docentes.toggleStatus');


    
    //Rutas espacios curricualres
    Route::resource('carreras', CarreraController::class);
    Route::resource('materias', MateriaController::class);
    Route::resource('comisiones', ComisionController::class);
    Route::resource('dictas', DictaController::class);
    Route::patch('materias/{materia}/toggle-status', [MateriaController::class, 'toggleStatus'])->name('materias.toggleStatus');
    Route::patch('carreras/{carrera}/toggle-status', [CarreraController::class, 'toggleStatus'])->name('carreras.toggleStatus');
    Route::patch('comisiones/{comision}/toggle-status', [ComisionController::class, 'toggleStatus'])->name('comisiones.toggleStatus');
    //Rutas planes
    Route::get('/planes/create/{carrera}', [PlanController::class, 'create'])->name('planes.create');
    Route::post('/planes/store', [PlanController::class, 'store'])->name('planes.store');
    Route::get('/planes/{plan}/edit', [PlanController::class, 'edit'])->name('planes.edit');
    Route::put('/planes/{plan}', [PlanController::class, 'update'])->name('planes.update');
    Route::patch('/planes/{plan}/desactivar', [PlanController::class, 'desactivar'])->name('planes.desactivar');
    Route::delete('/planes/{plan}', [PlanController::class, 'destroy'])->name('planes.destroy');

    // Rutas para la gestión de Horarios
    Route::get('comisiones/{comision}/horarios', [HorarioController::class, 'index'])->name('horarios.index');
    Route::post('comisiones/{comision}/horarios', [HorarioController::class, 'store'])->name('horarios.store');
    Route::delete('horarios/{horario}', [HorarioController::class, 'destroy'])->name('horarios.destroy');
});

Route::get('/test', fn() => Inertia::render('Test'))->name('test');

/*
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});
*/

require __DIR__ . '/auth.php';
