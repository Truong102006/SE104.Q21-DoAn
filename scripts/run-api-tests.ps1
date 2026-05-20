$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080"
$results = New-Object System.Collections.Generic.List[Object]

function Add-Result {
    param([string]$Name,[string]$Method,[string]$Path,[int]$Status,[string]$Expected,[bool]$Pass,[string]$Note)
    $results.Add([pscustomobject]@{
        Name = $Name
        Method = $Method
        Path = $Path
        Status = $Status
        Expected = $Expected
        Pass = $Pass
        Note = $Note
    })
}

function Parse-JsonData {
    param([string]$Content)
    if ([string]::IsNullOrWhiteSpace($Content)) { return $null }
    try {
        $obj = $Content | ConvertFrom-Json
        return $obj.data
    } catch {
        return $null
    }
}

function Invoke-Api {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Path,
        [string]$Token,
        $Body,
        [int[]]$ExpectedStatus
    )

    $uri = "$baseUrl$Path"
    $headers = @{}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    $jsonBody = $null
    if ($null -ne $Body) {
        $jsonBody = $Body | ConvertTo-Json -Depth 20
    }

    $status = -1
    $content = ""

    try {
        if ($null -ne $jsonBody) {
            $resp = Invoke-WebRequest -Uri $uri -Method $Method -Headers $headers -ContentType "application/json" -Body $jsonBody -UseBasicParsing
        } else {
            $resp = Invoke-WebRequest -Uri $uri -Method $Method -Headers $headers -UseBasicParsing
        }
        $status = [int]$resp.StatusCode
        $content = $resp.Content
    } catch {
        $ex = $_.Exception
        if ($ex.Response -ne $null) {
            try {
                $status = [int]$ex.Response.StatusCode.value__
            } catch {
                $status = -1
            }
            try {
                $stream = $ex.Response.GetResponseStream()
                if ($stream -ne $null) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $content = $reader.ReadToEnd()
                    $reader.Close()
                }
            } catch {
                $content = $ex.Message
            }
        } else {
            $content = $ex.Message
        }
    }

    $expectedText = ($ExpectedStatus -join ",")
    $pass = $ExpectedStatus -contains $status
    Add-Result -Name $Name -Method $Method -Path $Path -Status $status -Expected $expectedText -Pass $pass -Note ""

    return [pscustomobject]@{ Status = $status; Content = $content; Data = (Parse-JsonData -Content $content) }
}

function NextPhone {
    param([int]$idx)
    return ("09" + ("{0:D8}" -f $idx))
}

# Ensure backend running
$health = $null
try {
    $health = Invoke-WebRequest -Uri "$baseUrl/api/v1/health" -Method GET -UseBasicParsing -TimeoutSec 5
} catch {}

if ($null -eq $health -or [int]$health.StatusCode -ne 200) {
    Start-Process -FilePath "powershell" -ArgumentList "-NoProfile","-Command","cd 'c:\Users\ASUS\Documents\KÌ 4-UIT\SE104.Q21-DoAn'; npm run dev:backend" -WindowStyle Hidden
    $ok = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 2
        try {
            $h = Invoke-WebRequest -Uri "$baseUrl/api/v1/health" -Method GET -UseBasicParsing -TimeoutSec 5
            if ([int]$h.StatusCode -eq 200) { $ok = $true; break }
        } catch {}
    }
    if (-not $ok) {
        throw "Backend khong khoi dong duoc de test API"
    }
}

$seed = [int](Get-Date -UFormat %s)
$phoneCounter = 10000000 + ($seed % 1000000)

# --- Public + Auth ---
Invoke-Api -Name "Health check" -Method "GET" -Path "/api/v1/health" -Token $null -Body $null -ExpectedStatus @(200) | Out-Null
$loginAdmin = Invoke-Api -Name "Auth login admin" -Method "POST" -Path "/api/auth/login" -Token $null -Body @{ username = "admin"; password = "admin123" } -ExpectedStatus @(200)
$adminToken = $loginAdmin.Data.accessToken
$loginStaff = Invoke-Api -Name "Auth login staff" -Method "POST" -Path "/api/auth/login" -Token $null -Body @{ username = "staff"; password = "staff123" } -ExpectedStatus @(200)
$staffToken = $loginStaff.Data.accessToken
Invoke-Api -Name "Auth me admin" -Method "GET" -Path "/api/auth/me" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Auth logout admin" -Method "POST" -Path "/api/auth/logout" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Auth me unauthorized" -Method "GET" -Path "/api/auth/me" -Token $null -Body $null -ExpectedStatus @(401) | Out-Null
Invoke-Api -Name "Staff access admin endpoint" -Method "GET" -Path "/api/v1/tham-so" -Token $staffToken -Body $null -ExpectedStatus @(403) | Out-Null

# --- ChucNang ---
Invoke-Api -Name "ChucNang list" -Method "GET" -Path "/api/v1/chuc-nang" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$cnCreate = Invoke-Api -Name "ChucNang create" -Method "POST" -Path "/api/v1/chuc-nang" -Token $adminToken -Body @{ tenChucNang = "CN TEST $seed"; tenManHinhLoad = "test-screen" } -ExpectedStatus @(200)
$cnId = $cnCreate.Data.maChucNang
Invoke-Api -Name "ChucNang get by id" -Method "GET" -Path "/api/v1/chuc-nang/$cnId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "ChucNang update" -Method "PUT" -Path "/api/v1/chuc-nang/$cnId" -Token $adminToken -Body @{ tenChucNang = "CN TEST UPDATED $seed"; tenManHinhLoad = "test-screen-2" } -ExpectedStatus @(200) | Out-Null

# --- NhomNguoiDung ---
Invoke-Api -Name "NhomNguoiDung list" -Method "GET" -Path "/api/v1/nhom-nguoi-dung" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$nndCreate = Invoke-Api -Name "NhomNguoiDung create" -Method "POST" -Path "/api/v1/nhom-nguoi-dung" -Token $adminToken -Body @{ tenNhom = "NND TEST $seed" } -ExpectedStatus @(200)
$nndId = $nndCreate.Data.maNhom
Invoke-Api -Name "NhomNguoiDung get by id" -Method "GET" -Path "/api/v1/nhom-nguoi-dung/$nndId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "NhomNguoiDung update" -Method "PUT" -Path "/api/v1/nhom-nguoi-dung/$nndId" -Token $adminToken -Body @{ tenNhom = "NND TEST UPDATED $seed" } -ExpectedStatus @(200) | Out-Null

# --- PhanQuyen ---
Invoke-Api -Name "PhanQuyen list" -Method "GET" -Path "/api/v1/phan-quyen" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "PhanQuyen create" -Method "POST" -Path "/api/v1/phan-quyen" -Token $adminToken -Body @{ maNhom = $nndId; maChucNang = $cnId } -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "PhanQuyen get by id" -Method "GET" -Path "/api/v1/phan-quyen/$nndId/$cnId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null

# --- NguoiDung ---
Invoke-Api -Name "NguoiDung list" -Method "GET" -Path "/api/v1/nguoi-dung" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$userId = "user_test_$seed"
Invoke-Api -Name "NguoiDung create" -Method "POST" -Path "/api/v1/nguoi-dung" -Token $adminToken -Body @{ tenDangNhap = $userId; matKhau = "test123"; maNhom = $nndId } -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "NguoiDung get by id" -Method "GET" -Path "/api/v1/nguoi-dung/$userId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "NguoiDung update" -Method "PUT" -Path "/api/v1/nguoi-dung/$userId" -Token $adminToken -Body @{ matKhau = "test456"; maNhom = $nndId } -ExpectedStatus @(200) | Out-Null

# --- ThamSo ---
Invoke-Api -Name "ThamSo list" -Method "GET" -Path "/api/v1/tham-so" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$tsCreate = Invoke-Api -Name "ThamSo create" -Method "POST" -Path "/api/v1/tham-so" -Token $adminToken -Body @{ tenThamSo = "TS_TEST_$seed"; giaTri = 12.5 } -ExpectedStatus @(200)
$tsId = $tsCreate.Data.maThamSo
Invoke-Api -Name "ThamSo get by id" -Method "GET" -Path "/api/v1/tham-so/$tsId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "ThamSo update" -Method "PUT" -Path "/api/v1/tham-so/$tsId" -Token $adminToken -Body @{ tenThamSo = "TS_TEST_UPDATED_$seed"; giaTri = 15.75 } -ExpectedStatus @(200) | Out-Null

# --- Bao cao ---
Invoke-Api -Name "BaoCaoTonKho list" -Method "GET" -Path "/api/v1/bao-cao-ton-kho" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$bctkCreate = Invoke-Api -Name "BaoCaoTonKho create" -Method "POST" -Path "/api/v1/bao-cao-ton-kho" -Token $adminToken -Body @{ thang = 11; nam = 2098 } -ExpectedStatus @(200)
$bctkId = $bctkCreate.Data.maBaoCaoTonKho
Invoke-Api -Name "BaoCaoTonKho get by id" -Method "GET" -Path "/api/v1/bao-cao-ton-kho/$bctkId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "BaoCaoTonKho update" -Method "PUT" -Path "/api/v1/bao-cao-ton-kho/$bctkId" -Token $adminToken -Body @{ thang = 12; nam = 2098 } -ExpectedStatus @(200) | Out-Null

Invoke-Api -Name "BaoCaoDoanhThuSP list" -Method "GET" -Path "/api/v1/bao-cao-doanh-thu-san-pham" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$bcspCreate = Invoke-Api -Name "BaoCaoDoanhThuSP create" -Method "POST" -Path "/api/v1/bao-cao-doanh-thu-san-pham" -Token $adminToken -Body @{ thang = 9; nam = 2098; tongDoanhThuSanPham = 1000000 } -ExpectedStatus @(200)
$bcspId = $bcspCreate.Data.maBaoCaoDoanhThuSp
Invoke-Api -Name "BaoCaoDoanhThuSP get by id" -Method "GET" -Path "/api/v1/bao-cao-doanh-thu-san-pham/$bcspId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "BaoCaoDoanhThuSP update" -Method "PUT" -Path "/api/v1/bao-cao-doanh-thu-san-pham/$bcspId" -Token $adminToken -Body @{ thang = 10; nam = 2098; tongDoanhThuSanPham = 1200000 } -ExpectedStatus @(200) | Out-Null

Invoke-Api -Name "BaoCaoDoanhThuDV list" -Method "GET" -Path "/api/v1/bao-cao-doanh-thu-dich-vu" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$bcdvCreate = Invoke-Api -Name "BaoCaoDoanhThuDV create" -Method "POST" -Path "/api/v1/bao-cao-doanh-thu-dich-vu" -Token $adminToken -Body @{ thang = 7; nam = 2098; tongDoanhThuDichVu = 500000 } -ExpectedStatus @(200)
$bcdvId = $bcdvCreate.Data.maBaoCaoDoanhThuDv
Invoke-Api -Name "BaoCaoDoanhThuDV get by id" -Method "GET" -Path "/api/v1/bao-cao-doanh-thu-dich-vu/$bcdvId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "BaoCaoDoanhThuDV update" -Method "PUT" -Path "/api/v1/bao-cao-doanh-thu-dich-vu/$bcdvId" -Token $adminToken -Body @{ thang = 8; nam = 2098; tongDoanhThuDichVu = 550000 } -ExpectedStatus @(200) | Out-Null

# --- Catalog: DonViTinh ---
Invoke-Api -Name "Units list new" -Method "GET" -Path "/api/units" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Units list legacy" -Method "GET" -Path "/api/v1/don-vi-tinh" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$unitMain = Invoke-Api -Name "Units create main" -Method "POST" -Path "/api/units" -Token $adminToken -Body @{ tenDonViTinh = "DVT TEST MAIN $seed"; loaiDonVi = "TRANGSUC"; heSoQuyDoi = 1; ghiChu = "main" } -ExpectedStatus @(200)
$unitMainId = $unitMain.Data.maDonViTinh
Invoke-Api -Name "Units get by id" -Method "GET" -Path "/api/units/$unitMainId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Units get by id legacy" -Method "GET" -Path "/api/v1/don-vi-tinh/$unitMainId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Units update" -Method "PUT" -Path "/api/units/$unitMainId" -Token $adminToken -Body @{ tenDonViTinh = "DVT TEST MAIN U $seed"; loaiDonVi = "TRANGSUC"; heSoQuyDoi = 1.5; ghiChu = "updated" } -ExpectedStatus @(200) | Out-Null
$unitDel = Invoke-Api -Name "Units create delete" -Method "POST" -Path "/api/units" -Token $adminToken -Body @{ tenDonViTinh = "DVT TEST DEL $seed"; loaiDonVi = "TRANGSUC"; heSoQuyDoi = 1; ghiChu = "del" } -ExpectedStatus @(200)
$unitDelId = $unitDel.Data.maDonViTinh
Invoke-Api -Name "Units delete" -Method "DELETE" -Path "/api/units/$unitDelId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null

# --- Catalog: LoaiSanPham ---
Invoke-Api -Name "ProductTypes list new" -Method "GET" -Path "/api/product-types" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "ProductTypes list legacy" -Method "GET" -Path "/api/v1/loai-san-pham" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$ptMain = Invoke-Api -Name "ProductTypes create main" -Method "POST" -Path "/api/product-types" -Token $adminToken -Body @{ tenLoaiSanPham = "LSP TEST MAIN $seed"; tiLeLoiNhuan = 10 } -ExpectedStatus @(200)
$ptMainId = $ptMain.Data.maLoaiSanPham
Invoke-Api -Name "ProductTypes get by id" -Method "GET" -Path "/api/product-types/$ptMainId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "ProductTypes update" -Method "PUT" -Path "/api/product-types/$ptMainId" -Token $adminToken -Body @{ tenLoaiSanPham = "LSP TEST MAIN U $seed"; tiLeLoiNhuan = 12.5 } -ExpectedStatus @(200) | Out-Null
$ptDel = Invoke-Api -Name "ProductTypes create delete" -Method "POST" -Path "/api/product-types" -Token $adminToken -Body @{ tenLoaiSanPham = "LSP TEST DEL $seed"; tiLeLoiNhuan = 5 } -ExpectedStatus @(200)
$ptDelId = $ptDel.Data.maLoaiSanPham
Invoke-Api -Name "ProductTypes delete" -Method "DELETE" -Path "/api/product-types/$ptDelId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null

# --- Catalog: LoaiDichVu ---
Invoke-Api -Name "ServiceTypes list new" -Method "GET" -Path "/api/service-types" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "ServiceTypes list legacy" -Method "GET" -Path "/api/v1/loai-dich-vu" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$svMain = Invoke-Api -Name "ServiceTypes create main" -Method "POST" -Path "/api/service-types" -Token $adminToken -Body @{ tenLoaiDichVu = "LDV TEST MAIN $seed"; donGiaDichVu = 100000 } -ExpectedStatus @(200)
$svMainId = $svMain.Data.maLoaiDichVu
$svMain2 = Invoke-Api -Name "ServiceTypes create main 2" -Method "POST" -Path "/api/service-types" -Token $adminToken -Body @{ tenLoaiDichVu = "LDV TEST MAIN2 $seed"; donGiaDichVu = 150000 } -ExpectedStatus @(200)
$svMain2Id = $svMain2.Data.maLoaiDichVu
Invoke-Api -Name "ServiceTypes get by id" -Method "GET" -Path "/api/service-types/$svMainId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "ServiceTypes update" -Method "PUT" -Path "/api/service-types/$svMainId" -Token $adminToken -Body @{ tenLoaiDichVu = "LDV TEST MAIN U $seed"; donGiaDichVu = 110000 } -ExpectedStatus @(200) | Out-Null
$svDel = Invoke-Api -Name "ServiceTypes create delete" -Method "POST" -Path "/api/service-types" -Token $adminToken -Body @{ tenLoaiDichVu = "LDV TEST DEL $seed"; donGiaDichVu = 50000 } -ExpectedStatus @(200)
$svDelId = $svDel.Data.maLoaiDichVu
Invoke-Api -Name "ServiceTypes delete" -Method "DELETE" -Path "/api/service-types/$svDelId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null

# --- Catalog: Supplier ---
Invoke-Api -Name "Suppliers list new" -Method "GET" -Path "/api/suppliers" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Suppliers list legacy" -Method "GET" -Path "/api/v1/nha-cung-cap" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$supMain = Invoke-Api -Name "Suppliers create main" -Method "POST" -Path "/api/suppliers" -Token $adminToken -Body @{ tenNhaCungCap = "NCC TEST MAIN $seed"; soDienThoai = (NextPhone $phoneCounter); diaChi = "HCM"; ghiChu = "main" } -ExpectedStatus @(200)
$phoneCounter++
$supMainId = $supMain.Data.maNhaCungCap
Invoke-Api -Name "Suppliers get by id" -Method "GET" -Path "/api/suppliers/$supMainId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Suppliers get by id legacy" -Method "GET" -Path "/api/v1/nha-cung-cap/$supMainId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Suppliers update" -Method "PUT" -Path "/api/suppliers/$supMainId" -Token $adminToken -Body @{ tenNhaCungCap = "NCC TEST MAIN U $seed"; soDienThoai = (NextPhone $phoneCounter); diaChi = "HN"; ghiChu = "updated" } -ExpectedStatus @(200) | Out-Null
$phoneCounter++
$supDel = Invoke-Api -Name "Suppliers create delete" -Method "POST" -Path "/api/suppliers" -Token $adminToken -Body @{ tenNhaCungCap = "NCC TEST DEL $seed"; soDienThoai = (NextPhone $phoneCounter); diaChi = "DN"; ghiChu = "del" } -ExpectedStatus @(200)
$phoneCounter++
$supDelId = $supDel.Data.maNhaCungCap
Invoke-Api -Name "Suppliers delete" -Method "DELETE" -Path "/api/suppliers/$supDelId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null

# --- Catalog: Customer ---
Invoke-Api -Name "Customers list new" -Method "GET" -Path "/api/customers" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Customers list legacy" -Method "GET" -Path "/api/v1/khach-hang" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$cusMain = Invoke-Api -Name "Customers create main" -Method "POST" -Path "/api/customers" -Token $adminToken -Body @{ tenKhachHang = "KH TEST MAIN $seed"; soDienThoaiKhachHang = (NextPhone $phoneCounter); diaChiKhachHang = "HCM"; ghiChu = "main" } -ExpectedStatus @(200)
$phoneCounter++
$cusMainId = $cusMain.Data.maKhachHang
Invoke-Api -Name "Customers get by id" -Method "GET" -Path "/api/customers/$cusMainId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Customers get by id legacy" -Method "GET" -Path "/api/v1/khach-hang/$cusMainId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Customers update" -Method "PUT" -Path "/api/customers/$cusMainId" -Token $adminToken -Body @{ tenKhachHang = "KH TEST MAIN U $seed"; soDienThoaiKhachHang = (NextPhone $phoneCounter); diaChiKhachHang = "HN"; ghiChu = "updated" } -ExpectedStatus @(200) | Out-Null
$phoneCounter++
$cusDel = Invoke-Api -Name "Customers create delete" -Method "POST" -Path "/api/customers" -Token $adminToken -Body @{ tenKhachHang = "KH TEST DEL $seed"; soDienThoaiKhachHang = (NextPhone $phoneCounter); diaChiKhachHang = "DN"; ghiChu = "del" } -ExpectedStatus @(200)
$phoneCounter++
$cusDelId = $cusDel.Data.maKhachHang
Invoke-Api -Name "Customers delete" -Method "DELETE" -Path "/api/customers/$cusDelId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null

# --- Product ---
Invoke-Api -Name "Products list new" -Method "GET" -Path "/api/products" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Products list legacy" -Method "GET" -Path "/api/v1/san-pham" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$spMain = Invoke-Api -Name "Products create main" -Method "POST" -Path "/api/products" -Token $adminToken -Body @{ tenSanPham = "SP TEST MAIN $seed"; maLoaiSanPham = $ptMainId; maDonViTinh = $unitMainId; donGiaMua = 200000; tonKho = 0 } -ExpectedStatus @(200)
$spMainId = $spMain.Data.maSanPham
Invoke-Api -Name "Products get by id" -Method "GET" -Path "/api/products/$spMainId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Products search" -Method "GET" -Path "/api/products/search?keyword=SP%20TEST" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Products get by id legacy" -Method "GET" -Path "/api/v1/san-pham/$spMainId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Products update" -Method "PUT" -Path "/api/products/$spMainId" -Token $adminToken -Body @{ tenSanPham = "SP TEST MAIN U $seed"; maLoaiSanPham = $ptMainId; maDonViTinh = $unitMainId; donGiaMua = 220000; tonKho = 0 } -ExpectedStatus @(200) | Out-Null
$spDel = Invoke-Api -Name "Products create delete" -Method "POST" -Path "/api/products" -Token $adminToken -Body @{ tenSanPham = "SP TEST DEL $seed"; maLoaiSanPham = $ptMainId; maDonViTinh = $unitMainId; donGiaMua = 150000; tonKho = 0 } -ExpectedStatus @(200)
$spDelId = $spDel.Data.maSanPham
Invoke-Api -Name "Products delete" -Method "DELETE" -Path "/api/products/$spDelId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null

# Staff can access business endpoints
Invoke-Api -Name "Staff products list" -Method "GET" -Path "/api/products" -Token $staffToken -Body $null -ExpectedStatus @(200) | Out-Null

# --- Purchase ---
Invoke-Api -Name "Purchases list" -Method "GET" -Path "/api/purchases" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$pmCreate = Invoke-Api -Name "Purchases create" -Method "POST" -Path "/api/purchases" -Token $adminToken -Body @{ ngayLapPhieuMua = "2026-05-20"; maNhaCungCap = $supMainId; items = @(@{ maSanPham = $spMainId; soLuongMua = 10; maDonViTinh = $unitMainId; donGia = 300000 }) } -ExpectedStatus @(200)
$pmId = $pmCreate.Data.soPhieuMua
Invoke-Api -Name "Purchases get by id" -Method "GET" -Path "/api/purchases/$pmId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Purchases print-data" -Method "GET" -Path "/api/purchases/$pmId/print-data" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Purchases get by id legacy" -Method "GET" -Path "/api/v1/phieu-mua-hang/$pmId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null

# --- Sale ---
Invoke-Api -Name "Sales list" -Method "GET" -Path "/api/sales" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$pbCreate = Invoke-Api -Name "Sales create" -Method "POST" -Path "/api/sales" -Token $adminToken -Body @{ ngayLapPhieuBan = "2026-05-20"; maKhachHang = $cusMainId; items = @(@{ maSanPham = $spMainId; soLuong = 2 }) } -ExpectedStatus @(200)
$pbId = $pbCreate.Data.soPhieuBan
Invoke-Api -Name "Sales get by id" -Method "GET" -Path "/api/sales/$pbId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "Sales get by id legacy" -Method "GET" -Path "/api/v1/phieu-ban-hang/$pbId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null

# --- Service Ticket ---
Invoke-Api -Name "ServiceTickets list" -Method "GET" -Path "/api/service-tickets" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
$dvCreate = Invoke-Api -Name "ServiceTickets create" -Method "POST" -Path "/api/service-tickets" -Token $adminToken -Body @{ ngayLapPhieuDichVu = "2026-05-20"; maKhachHang = $cusMainId; items = @(@{ maLoaiDichVu = $svMainId; soLuongDichVu = 1; chiPhiRieng = 5000; tienTraTruoc = 60000 }, @{ maLoaiDichVu = $svMain2Id; soLuongDichVu = 1; chiPhiRieng = 0; tienTraTruoc = 80000 }) } -ExpectedStatus @(200)
$dvId = $dvCreate.Data.soPhieuDichVu
Invoke-Api -Name "ServiceTickets get by id" -Method "GET" -Path "/api/service-tickets/$dvId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "ServiceTickets get by id legacy" -Method "GET" -Path "/api/v1/phieu-dich-vu/$dvId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "ServiceTickets deliver item" -Method "PATCH" -Path "/api/service-tickets/$dvId/items/$svMainId/deliver" -Token $adminToken -Body @{ ngayGiao = "2026-05-21" } -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "ServiceTickets deliver all" -Method "PATCH" -Path "/api/service-tickets/$dvId/deliver-all" -Token $adminToken -Body @{ ngayGiao = "2026-05-22" } -ExpectedStatus @(200) | Out-Null

# --- Delete report/param and admin entities ---
Invoke-Api -Name "BaoCaoTonKho delete" -Method "DELETE" -Path "/api/v1/bao-cao-ton-kho/$bctkId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "BaoCaoDoanhThuSP delete" -Method "DELETE" -Path "/api/v1/bao-cao-doanh-thu-san-pham/$bcspId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "BaoCaoDoanhThuDV delete" -Method "DELETE" -Path "/api/v1/bao-cao-doanh-thu-dich-vu/$bcdvId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "ThamSo delete" -Method "DELETE" -Path "/api/v1/tham-so/$tsId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "NguoiDung delete" -Method "DELETE" -Path "/api/v1/nguoi-dung/$userId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "PhanQuyen delete" -Method "DELETE" -Path "/api/v1/phan-quyen/$nndId/$cnId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "NhomNguoiDung delete" -Method "DELETE" -Path "/api/v1/nhom-nguoi-dung/$nndId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null
Invoke-Api -Name "ChucNang delete" -Method "DELETE" -Path "/api/v1/chuc-nang/$cnId" -Token $adminToken -Body $null -ExpectedStatus @(200) | Out-Null

# --- Expected-failure delete endpoints after transaction existed ---
Invoke-Api -Name "ServiceTypes delete in use" -Method "DELETE" -Path "/api/service-types/$svMainId" -Token $adminToken -Body $null -ExpectedStatus @(400) | Out-Null
Invoke-Api -Name "Suppliers delete in use" -Method "DELETE" -Path "/api/suppliers/$supMainId" -Token $adminToken -Body $null -ExpectedStatus @(400) | Out-Null
Invoke-Api -Name "Customers delete in use" -Method "DELETE" -Path "/api/customers/$cusMainId" -Token $adminToken -Body $null -ExpectedStatus @(400) | Out-Null
Invoke-Api -Name "Units delete in use" -Method "DELETE" -Path "/api/units/$unitMainId" -Token $adminToken -Body $null -ExpectedStatus @(400) | Out-Null
Invoke-Api -Name "ProductTypes delete in use" -Method "DELETE" -Path "/api/product-types/$ptMainId" -Token $adminToken -Body $null -ExpectedStatus @(400) | Out-Null
Invoke-Api -Name "Products delete in use" -Method "DELETE" -Path "/api/products/$spMainId" -Token $adminToken -Body $null -ExpectedStatus @(400) | Out-Null

# write result files
$results | Export-Csv -Path "c:\Users\ASUS\Documents\KÌ 4-UIT\SE104.Q21-DoAn\api-test-results.csv" -NoTypeInformation -Encoding UTF8
$results | ConvertTo-Json -Depth 6 | Set-Content -Path "c:\Users\ASUS\Documents\KÌ 4-UIT\SE104.Q21-DoAn\api-test-results.json" -Encoding UTF8

$passCount = ($results | Where-Object { $_.Pass }).Count
$total = $results.Count
$failCount = $total - $passCount
Write-Output "TOTAL=$total PASS=$passCount FAIL=$failCount"
if ($failCount -gt 0) {
    Write-Output "FAILED_CASES:"
    $results | Where-Object { -not $_.Pass } | ForEach-Object { "- $($_.Name) [$($_.Method) $($_.Path)] status=$($_.Status) expected=$($_.Expected)" }
}

