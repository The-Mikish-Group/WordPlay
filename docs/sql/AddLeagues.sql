BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    ALTER TABLE [UserProgress] ADD [CohortId] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    ALTER TABLE [UserProgress] ADD [CurrentWeek] nvarchar(10) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    ALTER TABLE [UserProgress] ADD [LeagueDivision] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    ALTER TABLE [UserProgress] ADD [LeagueXp] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    ALTER TABLE [UserProgress] ADD [WeeklyXpStart] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    CREATE TABLE [LeagueBotMembers] (
        [Id] int NOT NULL IDENTITY,
        [CohortId] int NOT NULL,
        [Name] nvarchar(40) NOT NULL,
        [AvatarData] nvarchar(64) NULL,
        [WeeklyXp] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_LeagueBotMembers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    CREATE TABLE [LeagueCohorts] (
        [Id] int NOT NULL IDENTITY,
        [WeekId] nvarchar(10) NOT NULL,
        [Division] int NOT NULL,
        [SettledAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_LeagueCohorts] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    CREATE TABLE [LeagueResults] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [WeekId] nvarchar(10) NOT NULL,
        [Division] int NOT NULL,
        [Rank] int NOT NULL,
        [Outcome] nvarchar(10) NOT NULL,
        [RewardCoins] int NOT NULL,
        [RewardHoney] int NOT NULL,
        [RewardBeeId] nvarchar(40) NULL,
        [Claimed] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_LeagueResults] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    CREATE INDEX [IX_LeagueBotMembers_CohortId] ON [LeagueBotMembers] ([CohortId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    CREATE INDEX [IX_LeagueCohorts_WeekId_Division] ON [LeagueCohorts] ([WeekId], [Division]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    CREATE INDEX [IX_LeagueResults_UserId_Claimed] ON [LeagueResults] ([UserId], [Claimed]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260602015248_AddLeagues'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260602015248_AddLeagues', N'10.0.7');
END;

COMMIT;
GO

