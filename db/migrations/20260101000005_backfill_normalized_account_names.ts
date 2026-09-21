import type { Knex } from "knex";

function normalizeAccountName(name: string): string {
  return name.trim().toLowerCase();
}

export async function up(knex: Knex): Promise<void> {
  const hasNormalizedName = await knex.schema.hasColumn("accounts", "normalized_name");
  if (!hasNormalizedName) {
    await knex.schema.alterTable("accounts", (table) => {
      table.string("normalized_name");
    });
  }

  const accounts = await knex<{ id: string; name: string }>("accounts").select("id", "name");
  for (const account of accounts) {
    await knex("accounts")
      .where({ id: account.id })
      .update({ normalized_name: normalizeAccountName(account.name) });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasNormalizedName = await knex.schema.hasColumn("accounts", "normalized_name");
  if (!hasNormalizedName) {
    return;
  }

  await knex.schema.alterTable("accounts", (table) => {
    table.dropColumn("normalized_name");
  });
}
