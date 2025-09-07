type Updates = Record<string, string | number | null>;

export function buildUpdate(table: string, id: number, updates: Updates, allowedColumns: string[]) {
  // Keep only whitelisted columns

  console.log('Updates received:', updates);

  const entries = Object.entries(updates).filter(([key]) => allowedColumns.includes(key));

  if (entries.length === 0) {
    throw new Error('No valid columns to update');
  }

  // Build SET clause like "col1 = ?, col2 = ?, ..."
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');

  // Extract values in the same order, then append id for WHERE
  const values = entries.map(([, v]) => v);
  values.push(id);

  const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
  return { sql, values };
}