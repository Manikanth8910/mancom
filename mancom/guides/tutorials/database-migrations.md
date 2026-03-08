# Database Migrations

Guide for managing database schema changes.

## Overview

We use TypeORM migrations to version-control database changes. Every schema change should be a migration.

## Migration Strategy

- **Never** modify production data directly
- **Always** create a migration for schema changes
- **Test** migrations on local before committing
- Migrations should be **reversible** when possible

## Creating a Migration

### Option 1: Generate from Entity Changes

```bash
# After modifying an entity
cd services/my-service
npx typeorm migration:generate -d dist/data-source.js src/migrations/AddVisitorNotes
```

This compares entities to current schema and generates migration.

### Option 2: Create Empty Migration

```bash
npx typeorm migration:create src/migrations/AddVisitorNotes
```

Then write the migration manually.

## Migration Structure

```typescript
// src/migrations/1705312200000-AddVisitorNotes.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVisitorNotes1705312200000 implements MigrationInterface {
  name = 'AddVisitorNotes1705312200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "visitors"
      ADD COLUMN "notes" VARCHAR(500)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "visitors"
      DROP COLUMN "notes"
    `);
  }
}
```

## Running Migrations

### Run All Pending

```bash
npx typeorm migration:run -d dist/data-source.js
```

### Check Status

```bash
npx typeorm migration:show -d dist/data-source.js
```

### Rollback Last Migration

```bash
npx typeorm migration:revert -d dist/data-source.js
```

## Best Practices

### 1. Make Migrations Reversible

Always implement both `up()` and `down()`:

```typescript
async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "visitors" ADD COLUMN "notes" VARCHAR(500)`);
}

async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "visitors" DROP COLUMN "notes"`);
}
```

### 2. Use Transactions

TypeORM wraps migrations in transactions by default. For complex migrations:

```typescript
async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.startTransaction();
  try {
    await queryRunner.query(`...`);
    await queryRunner.query(`...`);
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  }
}
```

### 3. Handle Data Migrations

When adding NOT NULL columns:

```typescript
async up(queryRunner: QueryRunner): Promise<void> {
  // 1. Add column as nullable
  await queryRunner.query(`
    ALTER TABLE "visitors" ADD COLUMN "flat_id" UUID
  `);

  // 2. Backfill existing data
  await queryRunner.query(`
    UPDATE "visitors" SET "flat_id" = (
      SELECT "flat_id" FROM "users" WHERE "users"."id" = "visitors"."created_by"
    )
  `);

  // 3. Make column NOT NULL
  await queryRunner.query(`
    ALTER TABLE "visitors" ALTER COLUMN "flat_id" SET NOT NULL
  `);

  // 4. Add foreign key
  await queryRunner.query(`
    ALTER TABLE "visitors"
    ADD CONSTRAINT "FK_visitors_flat"
    FOREIGN KEY ("flat_id") REFERENCES "flats"("id")
  `);
}
```

### 4. Keep Migrations Small

One logical change per migration:
- Add a column
- Create an index
- Modify a constraint

Don't bundle unrelated changes.

### 5. Test Migrations

Before committing:

```bash
# Run migration
npx typeorm migration:run -d dist/data-source.js

# Verify schema
psql -U mancom -d mancom -c '\d visitors'

# Rollback
npx typeorm migration:revert -d dist/data-source.js

# Verify rollback worked
psql -U mancom -d mancom -c '\d visitors'

# Run again
npx typeorm migration:run -d dist/data-source.js
```

## Common Operations

### Add Column

```typescript
await queryRunner.query(`
  ALTER TABLE "visitors"
  ADD COLUMN "vehicle_number" VARCHAR(20)
`);
```

### Drop Column

```typescript
await queryRunner.query(`
  ALTER TABLE "visitors"
  DROP COLUMN "vehicle_number"
`);
```

### Create Index

```typescript
await queryRunner.query(`
  CREATE INDEX "IDX_visitors_society_status"
  ON "visitors" ("society_id", "status")
`);
```

### Add Foreign Key

```typescript
await queryRunner.query(`
  ALTER TABLE "visitors"
  ADD CONSTRAINT "FK_visitors_flat"
  FOREIGN KEY ("flat_id") REFERENCES "flats"("id")
  ON DELETE CASCADE
`);
```

### Rename Column

```typescript
await queryRunner.query(`
  ALTER TABLE "visitors"
  RENAME COLUMN "guest_name" TO "name"
`);
```

## Naming Convention

Migration files: `{timestamp}-{Description}.ts`

Examples:
- `1705312200000-CreateVisitorsTable.ts`
- `1705398600000-AddVisitorNotes.ts`
- `1705485000000-AddSocietyIdIndex.ts`

## Checklist

- [ ] Migration has descriptive name
- [ ] Both `up()` and `down()` implemented
- [ ] Tested locally (up and down)
- [ ] No data loss in down migration
- [ ] Large data migrations are batched
- [ ] Indexes added for common queries
