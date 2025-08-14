-- Postgres
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Fossil' AND column_name = 'local'
  ) THEN
    ALTER TABLE "Fossil" RENAME COLUMN "local" TO "localizacao";
  END IF;
END
$$;
