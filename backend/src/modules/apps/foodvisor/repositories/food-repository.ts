import type pg from "pg";
import { camelizeRow, camelizeRows, splitTotal } from "../../../../utils/sql.js";
import type { IFoodRepository } from "../domain/IFoodRepository.js";
import type { Food, FoodPoolFilter, FoodQuery } from "../models/food.js";

const SELECT_COLUMNS = `id, korean_name, chinese_name, brand, category, food_group, food_subgroup, serving_size, calories,
  macros, sugar, saturated_fat, cholesterol_mg, glycemic_index, vitamins, minerals, allergens, caution_groups, benefits,
  tags, barcode, image_url, icon, data_source, source_food_id, source_nutrition, doctor_verified`;

export class FoodRepository implements IFoodRepository {
  constructor(private pool: pg.Pool) {}

  async search(query: FoodQuery): Promise<{ items: Food[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    if (query.q) {
      values.push(query.q);
      conditions.push(
        `(search @@ plainto_tsquery('simple', $${values.length}) OR korean_name ILIKE '%' || $${values.length} || '%' OR chinese_name ILIKE '%' || $${values.length} || '%')`
      );
    }
    if (query.category) {
      values.push(query.category);
      conditions.push(`category = $${values.length}`);
    }
    values.push(query.limit, query.offset);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await this.pool.query(
      `SELECT ${SELECT_COLUMNS}, COUNT(*) OVER() AS total_count FROM foodvisor.foods ${where}
       ORDER BY doctor_verified DESC, korean_name LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return splitTotal<Food>(result.rows);
  }

  async findById(id: string): Promise<Food | null> {
    const result = await this.pool.query(`SELECT ${SELECT_COLUMNS} FROM foodvisor.foods WHERE id = $1`, [id]);
    return result.rows[0] ? camelizeRow<Food>(result.rows[0]) : null;
  }

  async findByIds(ids: string[]): Promise<Food[]> {
    if (ids.length === 0) return [];
    const result = await this.pool.query(`SELECT ${SELECT_COLUMNS} FROM foodvisor.foods WHERE id = ANY($1::uuid[])`, [ids]);
    return camelizeRows<Food>(result.rows);
  }

  async findByBarcode(barcode: string): Promise<Food | null> {
    const result = await this.pool.query(
      `SELECT ${SELECT_COLUMNS} FROM foodvisor.foods WHERE barcode = $1 ORDER BY doctor_verified DESC LIMIT 1`,
      [barcode]
    );
    return result.rows[0] ? camelizeRow<Food>(result.rows[0]) : null;
  }

  async optimizerPool(filter: FoodPoolFilter): Promise<Food[]> {
    const conditions = ["calories > 0"];
    const values: unknown[] = [];
    if (filter.dataSource) {
      values.push(filter.dataSource);
      conditions.push(`data_source = $${values.length}`);
    }
    if (filter.includeCategories?.length) {
      values.push(filter.includeCategories);
      conditions.push(`lower(category) = ANY($${values.length}::text[])`);
    }
    if (filter.excludeCategories?.length) {
      values.push(filter.excludeCategories);
      conditions.push(`NOT (lower(coalesce(category, '')) = ANY($${values.length}::text[]))`);
    }
    values.push(filter.limit);
    const result = await this.pool.query(
      `SELECT ${SELECT_COLUMNS} FROM foodvisor.foods WHERE ${conditions.join(" AND ")}
       ORDER BY data_source NULLS LAST, source_food_id NULLS LAST, korean_name LIMIT $${values.length}`,
      values
    );
    return camelizeRows<Food>(result.rows);
  }
}
