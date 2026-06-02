/*
    Tro88 domain seed data.

    This script does not create users. It uses the first active Owner and
    Tenant already present in dbo.Users, then creates sample domain data:
    houses, rooms, room images, service fees, contracts, tenant-in-room rows,
    utility readings, invoices, line items, maintenance requests,
    notifications, audit logs, and AI conversation/task data.

    Run from SQL Server Management Studio or:
      sqlcmd -S <server> -d <database> -i scripts/seed-domain-data.sql
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @OwnerId uniqueidentifier;
DECLARE @TenantId uniqueidentifier;
DECLARE @Now datetime2 = SYSUTCDATETIME();

SELECT TOP (1) @OwnerId = Id
FROM dbo.Users
WHERE Role = 'Owner'
  AND IsActive = 1
  AND IsDeleted = 0
ORDER BY CreatedAt, Id;

SELECT TOP (1) @TenantId = Id
FROM dbo.Users
WHERE Role = 'Tenant'
  AND IsActive = 1
  AND IsDeleted = 0
ORDER BY CreatedAt, Id;

IF @OwnerId IS NULL
    THROW 51000, 'Seed aborted: dbo.Users must contain at least one active Owner.', 1;

IF @TenantId IS NULL
    THROW 51001, 'Seed aborted: dbo.Users must contain at least one active Tenant.', 1;

IF EXISTS (SELECT 1 FROM dbo.Houses WHERE Name = N'Seed House 1 - Demo')
BEGIN
    PRINT 'Seed data already exists. Nothing changed.';
    RETURN;
END;

BEGIN TRANSACTION;

DECLARE @House1Id uniqueidentifier = NEWID();
DECLARE @House2Id uniqueidentifier = NEWID();

INSERT INTO dbo.Houses
(
    Id, OwnerId, Name, Address, Province, District, Description, MediaUrls,
    Status, IsActive, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy,
    IsDeleted, DeletedAt, DeletedBy
)
VALUES
(
    @House1Id, @OwnerId, N'Seed House 1 - Demo',
    N'12 Nguyen Trai, Thanh Xuan', N'Ha Noi', N'Thanh Xuan',
    N'Demo boarding house near universities and office buildings.',
    N'["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"]',
    'Active', 1, @Now, @OwnerId, NULL, NULL, 0, NULL, NULL
),
(
    @House2Id, @OwnerId, N'Seed House 2 - Demo',
    N'88 Le Van Viet, Thu Duc', N'Ho Chi Minh', N'Thu Duc',
    N'Demo serviced rooms with parking and shared laundry.',
    N'["https://images.unsplash.com/photo-1564013799919-ab600027ffc6","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"]',
    'Active', 1, @Now, @OwnerId, NULL, NULL, 0, NULL, NULL
);

DECLARE @Rooms table
(
    RoomId uniqueidentifier NOT NULL,
    HouseId uniqueidentifier NOT NULL,
    RoomNumber varchar(50) NOT NULL,
    MonthlyRent decimal(18, 2) NOT NULL,
    DepositAmount decimal(18, 2) NOT NULL,
    ElectricityUnitPrice decimal(18, 2) NOT NULL,
    WaterUnitPrice decimal(18, 2) NOT NULL,
    SeedStatus varchar(20) NOT NULL
);

INSERT INTO @Rooms
(
    RoomId, HouseId, RoomNumber, MonthlyRent, DepositAmount,
    ElectricityUnitPrice, WaterUnitPrice, SeedStatus
)
VALUES
(NEWID(), @House1Id, '101', 2500000, 2500000, 4000, 18000, 'Occupied'),
(NEWID(), @House1Id, '102', 2700000, 2700000, 4000, 18000, 'Available'),
(NEWID(), @House1Id, '201', 3200000, 3200000, 4000, 18000, 'Occupied'),
(NEWID(), @House1Id, '202', 3100000, 3100000, 4000, 18000, 'Maintenance'),
(NEWID(), @House2Id, 'A01', 2800000, 2800000, 4200, 19000, 'Occupied'),
(NEWID(), @House2Id, 'A02', 3000000, 3000000, 4200, 19000, 'Available'),
(NEWID(), @House2Id, 'B01', 3500000, 3500000, 4200, 19000, 'Available'),
(NEWID(), @House2Id, 'B02', 3600000, 3600000, 4200, 19000, 'Maintenance');

INSERT INTO dbo.Rooms
(
    Id, HouseId, RoomNumber, Floor, Area, MaxOccupants, MonthlyRent,
    DepositAmount, Status, ElectricityUnitPrice, WaterUnitPrice, Description,
    CreatedAt, CreatedBy, UpdatedAt, UpdatedBy, IsDeleted, DeletedAt, DeletedBy
)
SELECT
    r.RoomId,
    r.HouseId,
    r.RoomNumber,
    CASE WHEN LEFT(r.RoomNumber, 1) IN ('A', 'B') THEN 1 ELSE TRY_CONVERT(int, LEFT(r.RoomNumber, 1)) END,
    CASE WHEN r.MonthlyRent >= 3500000 THEN 32 ELSE 24 END,
    CASE WHEN r.MonthlyRent >= 3200000 THEN 3 ELSE 2 END,
    r.MonthlyRent,
    r.DepositAmount,
    r.SeedStatus,
    r.ElectricityUnitPrice,
    r.WaterUnitPrice,
    N'Seed room for demo and testing.',
    @Now,
    @OwnerId,
    NULL,
    NULL,
    0,
    NULL,
    NULL
FROM @Rooms r;

INSERT INTO dbo.RoomImages
(
    Id, RoomId, Url, PublicId, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
)
SELECT
    NEWID(),
    r.RoomId,
    CONCAT('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?room=', r.RoomNumber),
    CONCAT('seed/rooms/', r.RoomNumber),
    @Now,
    @OwnerId,
    NULL,
    NULL
FROM @Rooms r;

INSERT INTO dbo.ServiceFees
(
    Id, HouseId, Name, FeeType, Amount, Unit, IsActive,
    CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
)
VALUES
(NEWID(), @House1Id, N'Internet', 'Fixed', 100000, N'room', 1, @Now, @OwnerId, NULL, NULL),
(NEWID(), @House1Id, N'Parking', 'Fixed', 150000, N'motorbike', 1, @Now, @OwnerId, NULL, NULL),
(NEWID(), @House1Id, N'Cleaning', 'Fixed', 50000, N'room', 1, @Now, @OwnerId, NULL, NULL),
(NEWID(), @House2Id, N'Internet', 'Fixed', 120000, N'room', 1, @Now, @OwnerId, NULL, NULL),
(NEWID(), @House2Id, N'Parking', 'Fixed', 180000, N'motorbike', 1, @Now, @OwnerId, NULL, NULL),
(NEWID(), @House2Id, N'Laundry', 'Fixed', 80000, N'room', 1, @Now, @OwnerId, NULL, NULL);

DECLARE @Contracts table
(
    ContractId uniqueidentifier NOT NULL,
    RoomId uniqueidentifier NOT NULL,
    ContractCode varchar(50) NOT NULL,
    MonthlyRent decimal(18, 2) NOT NULL,
    DepositAmount decimal(18, 2) NOT NULL,
    StartDate datetime2 NOT NULL,
    EndDate datetime2 NOT NULL
);

INSERT INTO @Contracts
(
    ContractId, RoomId, ContractCode, MonthlyRent, DepositAmount,
    StartDate, EndDate
)
SELECT
    NEWID(),
    r.RoomId,
    CONCAT('SEED-CTR-', ROW_NUMBER() OVER (ORDER BY r.RoomNumber)),
    r.MonthlyRent,
    r.DepositAmount,
    DATEFROMPARTS(YEAR(@Now), 1, 1),
    DATEFROMPARTS(YEAR(@Now), 12, 31)
FROM @Rooms r
WHERE r.SeedStatus = 'Occupied';

INSERT INTO dbo.Contracts
(
    Id, RoomId, TenantId, OwnerId, ContractCode, StartDate, EndDate,
    MonthlyRent, DepositAmount, PaymentDayOfMonth, Status, Terms, SignedAt,
    CreatedAt, CreatedBy, UpdatedAt, UpdatedBy, IsDeleted, DeletedAt, DeletedBy
)
SELECT
    c.ContractId,
    c.RoomId,
    @TenantId,
    @OwnerId,
    c.ContractCode,
    c.StartDate,
    c.EndDate,
    c.MonthlyRent,
    c.DepositAmount,
    5,
    'Active',
    N'Seed contract terms for demo data.',
    DATEADD(day, -7, @Now),
    @Now,
    @OwnerId,
    NULL,
    NULL,
    0,
    NULL,
    NULL
FROM @Contracts c;

INSERT INTO dbo.TenantInRooms
(
    Id, ContractId, UserId, CheckIn, CheckOut, Status,
    CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
)
SELECT
    NEWID(),
    c.ContractId,
    @TenantId,
    c.StartDate,
    NULL,
    'staying',
    @Now,
    @OwnerId,
    NULL,
    NULL
FROM @Contracts c;

DECLARE @Month1 int = MONTH(DATEADD(month, -2, @Now));
DECLARE @Year1 int = YEAR(DATEADD(month, -2, @Now));
DECLARE @Month2 int = MONTH(DATEADD(month, -1, @Now));
DECLARE @Year2 int = YEAR(DATEADD(month, -1, @Now));

INSERT INTO dbo.UtilityReadings
(
    Id, RoomId, Month, Year, ElectricityOld, ElectricityNew, ElectricityUsage,
    WaterOld, WaterNew, WaterUsage, Notes, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
)
SELECT
    NEWID(), r.RoomId, @Month1, @Year1,
    100 + ROW_NUMBER() OVER (ORDER BY r.RoomNumber) * 20,
    145 + ROW_NUMBER() OVER (ORDER BY r.RoomNumber) * 20,
    45,
    20 + ROW_NUMBER() OVER (ORDER BY r.RoomNumber) * 4,
    27 + ROW_NUMBER() OVER (ORDER BY r.RoomNumber) * 4,
    7,
    N'Seed previous month reading.',
    DATEADD(month, -2, @Now),
    @OwnerId,
    NULL,
    NULL
FROM @Rooms r
UNION ALL
SELECT
    NEWID(), r.RoomId, @Month2, @Year2,
    145 + ROW_NUMBER() OVER (ORDER BY r.RoomNumber) * 20,
    198 + ROW_NUMBER() OVER (ORDER BY r.RoomNumber) * 20,
    53,
    27 + ROW_NUMBER() OVER (ORDER BY r.RoomNumber) * 4,
    36 + ROW_NUMBER() OVER (ORDER BY r.RoomNumber) * 4,
    9,
    N'Seed latest month reading.',
    DATEADD(month, -1, @Now),
    @OwnerId,
    NULL,
    NULL
FROM @Rooms r;

DECLARE @Invoices table
(
    InvoiceId uniqueidentifier NOT NULL,
    ContractId uniqueidentifier NOT NULL,
    RoomId uniqueidentifier NOT NULL,
    InvoiceCode varchar(50) NOT NULL,
    BillingMonth int NOT NULL,
    BillingYear int NOT NULL,
    RentAmount decimal(18, 2) NOT NULL,
    ElectricityAmount decimal(18, 2) NOT NULL,
    WaterAmount decimal(18, 2) NOT NULL,
    ServiceAmount decimal(18, 2) NOT NULL,
    Status varchar(20) NOT NULL
);

INSERT INTO @Invoices
(
    InvoiceId, ContractId, RoomId, InvoiceCode, BillingMonth, BillingYear,
    RentAmount, ElectricityAmount, WaterAmount, ServiceAmount, Status
)
SELECT
    NEWID(),
    c.ContractId,
    c.RoomId,
    CONCAT('SEED-INV-', c.ContractCode, '-', @Year2, RIGHT(CONCAT('0', @Month2), 2)),
    @Month2,
    @Year2,
    c.MonthlyRent,
    53 * r.ElectricityUnitPrice,
    9 * r.WaterUnitPrice,
    300000,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY c.ContractCode) = 1 THEN 'Paid' ELSE 'Unpaid' END
FROM @Contracts c
JOIN @Rooms r ON r.RoomId = c.RoomId;

INSERT INTO dbo.Invoices
(
    Id, ContractId, RoomId, InvoiceCode, BillingMonth, BillingYear,
    RentAmount, ElectricityAmount, WaterAmount, ServiceAmount, TotalAmount,
    DueDate, PaidAt, Status, Notes,
    CreatedAt, CreatedBy, UpdatedAt, UpdatedBy, IsDeleted, DeletedAt, DeletedBy
)
SELECT
    i.InvoiceId,
    i.ContractId,
    i.RoomId,
    i.InvoiceCode,
    i.BillingMonth,
    i.BillingYear,
    i.RentAmount,
    i.ElectricityAmount,
    i.WaterAmount,
    i.ServiceAmount,
    i.RentAmount + i.ElectricityAmount + i.WaterAmount + i.ServiceAmount,
    DATEFROMPARTS(i.BillingYear, i.BillingMonth, 5),
    CASE WHEN i.Status = 'Paid' THEN DATEADD(day, -3, @Now) ELSE NULL END,
    i.Status,
    N'Seed invoice for demo data.',
    @Now,
    @OwnerId,
    NULL,
    NULL,
    0,
    NULL,
    NULL
FROM @Invoices i;

INSERT INTO dbo.InvoiceLineItems
(
    Id, InvoiceId, Description, UnitPrice, Quantity, Amount
)
SELECT NEWID(), InvoiceId, N'Monthly rent', RentAmount, 1, RentAmount
FROM @Invoices
UNION ALL
SELECT NEWID(), InvoiceId, N'Electricity', ElectricityAmount / 53, 53, ElectricityAmount
FROM @Invoices
UNION ALL
SELECT NEWID(), InvoiceId, N'Water', WaterAmount / 9, 9, WaterAmount
FROM @Invoices
UNION ALL
SELECT NEWID(), InvoiceId, N'Service fees', ServiceAmount, 1, ServiceAmount
FROM @Invoices;

DECLARE @MaintenanceRoomId uniqueidentifier =
(
    SELECT TOP (1) RoomId FROM @Rooms WHERE SeedStatus = 'Maintenance' ORDER BY RoomNumber
);

INSERT INTO dbo.MaintenanceRequests
(
    Id, RoomId, RequestedByUserId, AssignedToUserId, Title, Description,
    Category, Priority, Status, ResolvedAt, ResolutionNote, ImageUrls,
    CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
)
VALUES
(
    NEWID(), @MaintenanceRoomId, @TenantId, @OwnerId,
    N'Air conditioner check', N'AC is not cooling consistently.',
    'Electrical', 'High', 'InProgress', NULL, NULL,
    N'["https://images.unsplash.com/photo-1581092160562-40aa08e78837"]',
    @Now, @TenantId, NULL, NULL
),
(
    NEWID(), (SELECT TOP (1) RoomId FROM @Rooms WHERE SeedStatus = 'Occupied' ORDER BY RoomNumber), @TenantId, NULL,
    N'Water leak under sink', N'Small leak visible below the bathroom sink.',
    'Plumbing', 'Medium', 'Open', NULL, NULL,
    N'[]',
    DATEADD(day, -1, @Now), @TenantId, NULL, NULL
);

INSERT INTO dbo.Notifications
(
    Id, UserId, Title, Body, Type, ReferenceId, Status, ReadAt,
    CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
)
SELECT TOP (1)
    NEWID(), @TenantId, N'Invoice created', N'A seed invoice is ready for payment.',
    'Invoice', InvoiceId, 'Unread', NULL, @Now, @OwnerId, NULL, NULL
FROM @Invoices
UNION ALL
SELECT
    NEWID(), @OwnerId, N'Maintenance request', N'A tenant created a seed maintenance request.',
    'Maintenance', @MaintenanceRoomId, 'Read', DATEADD(hour, -2, @Now), @Now, @TenantId, NULL, NULL;

DECLARE @ConversationId uniqueidentifier = NEWID();

INSERT INTO dbo.AiConversations
(
    Id, UserId, Title, IsActive, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
)
VALUES
(
    @ConversationId, @OwnerId, N'Seed owner dashboard assistant', 1,
    @Now, @OwnerId, NULL, NULL
);

INSERT INTO dbo.AiMessages
(
    Id, ConversationId, Role, Content, InputTokens, OutputTokens, CreatedAt
)
VALUES
(NEWID(), @ConversationId, 'user', N'Summarize unpaid seed invoices.', 12, NULL, DATEADD(minute, -4, @Now)),
(NEWID(), @ConversationId, 'assistant', N'There are unpaid seed invoices for occupied demo rooms.', 18, 14, DATEADD(minute, -3, @Now));

INSERT INTO dbo.AiAgentTasks
(
    Id, ConversationId, UserId, TaskType, Input, Output, Status,
    ErrorMessage, CompletedAt, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
)
VALUES
(
    NEWID(), @ConversationId, @OwnerId, 'GetUnpaidInvoices',
    N'{"scope":"seed"}', N'{"count":2}', 'Completed',
    NULL, DATEADD(minute, -2, @Now), @Now, @OwnerId, NULL, NULL
);

INSERT INTO dbo.AuditLogs
(
    Id, UserId, Action, Module, TargetId, OldValues, NewValues, IpAddress, CreatedAt
)
VALUES
(NEWID(), @OwnerId, 'Create', 'House', @House1Id, NULL, N'{"source":"seed"}', '127.0.0.1', @Now),
(NEWID(), @OwnerId, 'Create', 'Room', NULL, NULL, N'{"source":"seed"}', '127.0.0.1', @Now),
(NEWID(), @OwnerId, 'Create', 'Invoice', NULL, NULL, N'{"source":"seed"}', '127.0.0.1', @Now);

COMMIT TRANSACTION;

PRINT 'Seed data created successfully.';
