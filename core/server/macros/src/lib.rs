
use proc_macro::TokenStream;
use quote::{format_ident, quote};
use syn::{Attribute, DeriveInput, Meta, parse_macro_input};

/// A procedural macro that automatically applies common Diesel ORM traits and attributes
/// to structs. It can optionally specify a custom table name.
/// 
/// Usage: 
/// - #[diesel_default] for default table inference
/// - #[diesel_default(custom_table_name)] for explicit table name
#[proc_macro_attribute]
pub fn diesel_default(attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = parse_macro_input!(item as DeriveInput);

    // Parse the optional table name from the attribute parameters
    let table_name = if attr.is_empty() {
        None
    } else {
        let attr_str = attr.to_string();
        Some(syn::parse_str::<syn::Path>(&attr_str).unwrap())
    };

    // Generate table-specific attributes based on whether a custom table name was provided
    let table_attr = if let Some(table) = table_name {
        quote! {
            #[diesel(check_for_backend(diesel::pg::Pg))]
            #[diesel(table_name = #table)]
        }
    } else {
        quote! {
            #[diesel(check_for_backend(diesel::pg::Pg))]
        }
    };

    // Generate the expanded code with all necessary Diesel and Serde derives
    let expanded = quote! {
        #[derive(serde::Deserialize, serde::Serialize, Debug)]
        #[derive(diesel::Queryable, diesel::Selectable, diesel::Identifiable, diesel::Insertable, diesel::AsChangeset)]
        #table_attr
        #input
    };

    TokenStream::from(expanded)
}

/// Represents a database update operation configuration
/// Contains the field to filter by and the fields to update
#[derive(Debug)]
struct UpdateOperation {
    filter_by: String,        // Field used to identify records (e.g., "id", "email")
    update_fields: Vec<String>, // Fields that will be updated
}

/// Configuration for all database operations that should be generated
/// Each boolean/vector represents different types of CRUD operations
#[derive(Debug)]
struct DatabaseOperations {
    create: bool,                      // Generate create method
    updates: Vec<UpdateOperation>,     // Generate update methods with specific configurations
    deletes: Vec<String>,             // Generate delete methods filtered by these fields
    gets: Vec<String>,                // Generate get methods filtered by these fields  
    get_all: bool,                    // Generate get_all method
}

/// A procedural macro that automatically generates CRUD methods for database entities
/// 
/// Usage examples:
/// - #[database(create, get_all)] - generates create and get_all methods
/// - #[database(get(id, email), delete(id))] - generates getters and delete by id
/// - #[database(update(id{name,email}))] - generates update method for name and email filtered by id
#[proc_macro_attribute]
pub fn database(attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = parse_macro_input!(item as DeriveInput);
    let struct_name = &input.ident;

    // Extract the table name from Diesel attributes on the struct
    let table_name = extract_table_name(&input.attrs);

    // Parse the macro attributes to determine which operations to generate
    let operations = parse_database_operations(&attr.to_string());

    // Generate the implementation block with all requested methods
    let impl_block = generate_methods(&struct_name, &table_name, &operations);

    // Combine original struct with generated implementation
    let expanded = quote! {
        #input

        #impl_block
    };

    TokenStream::from(expanded)
}

/// Extracts the table name from Diesel attributes on a struct
/// Looks for #[diesel(table_name = "table_name")] patterns in the attributes
fn extract_table_name(attrs: &[Attribute]) -> String {
    // First pass: Look for explicit table_name in diesel attributes
    for attr in attrs {
        if !attr.path().is_ident("diesel") {
            continue;
        }

        match &attr.meta {
            Meta::List(meta_list) => {
                let tokens = meta_list.tokens.clone();
                let token_str = tokens.to_string();

                // Check for table_name = "value" pattern
                if token_str.contains("table_name") {
                    let parts: Vec<&str> = token_str.split('=').collect();
                    if parts.len() > 1 {
                        let value_part = parts[1].trim();
                        if value_part.starts_with('"') && value_part.ends_with('"') {
                            let table_name = value_part.trim_matches('"');
                            return table_name.to_string();
                        }
                    }
                }
            }
            _ => continue,
        }
    }

    // Second pass: Alternative parsing method for edge cases
    for attr in attrs {
        if attr.path().is_ident("diesel") {
            match &attr.meta {
                Meta::List(meta_list) => {
                    let tokens = meta_list.tokens.clone();
                    let token_str = tokens.to_string();

                    if let Some(pos) = token_str.find("table_name") {
                        let rest = &token_str[pos..];
                        if let Some(pos) = rest.find('=') {
                            let after_eq = &rest[pos + 1..];
                            let trimmed = after_eq.trim();

                            if let Some(end) = trimmed.find(',') {
                                return trimmed[..end].trim().to_string();
                            } else {
                                return trimmed.to_string();
                            }
                        }
                    }
                }
                _ => continue,
            }
        }
    }

    panic!("Not found table name");
}

/// Parses the database macro attributes to determine which operations to generate
/// Handles complex syntax like: create, get(id, email), update(id{name,email}), delete(id)
fn parse_database_operations(attr_str: &str) -> DatabaseOperations {
    let mut ops = DatabaseOperations {
        create: false,
        updates: Vec::new(),
        deletes: Vec::new(),
        gets: Vec::new(),
        get_all: false,
    };

    // Remove spaces to simplify parsing
    let clean_attr = attr_str.replace(" ", "");

    let mut current_pos = 0;
    while current_pos < clean_attr.len() {
        // Parse "create" operation
        if clean_attr[current_pos..].starts_with("create") {
            ops.create = true;
            current_pos += 6;
        } 
        // Parse "update(...)" operations with complex syntax
        else if clean_attr[current_pos..].starts_with("update(") {
            let start_pos = current_pos + 7;
            let mut nested = 0;
            let mut end_pos = start_pos;

            // Find the matching closing parenthesis, accounting for nested structures
            for (i, c) in clean_attr[start_pos..].chars().enumerate() {
                if c == '(' || c == '{' {
                    nested += 1;
                } else if c == ')' || c == '}' {
                    if nested == 0 {
                        end_pos = start_pos + i;
                        break;
                    }
                    nested -= 1;
                }
            }

            let update_content = &clean_attr[start_pos..end_pos];

            // Split update operations by commas (not inside braces)
            let mut update_parts = Vec::new();
            let mut part_start = 0;
            let mut brace_count = 0;

            for (i, c) in update_content.chars().enumerate() {
                if c == '{' {
                    brace_count += 1;
                } else if c == '}' {
                    brace_count -= 1;
                } else if c == ',' && brace_count == 0 {
                    update_parts.push(&update_content[part_start..i]);
                    part_start = i + 1;
                }
            }

            if part_start < update_content.len() {
                update_parts.push(&update_content[part_start..]);
            }

            // Process each update operation part
            for up in update_parts {
                if up.contains('{') {
                    // Handle "field{field1,field2}" syntax
                    let filter_end = up.find('{').unwrap();
                    let filter_by = up[..filter_end].to_string();

                    let fields_part = &up[filter_end + 1..up.len() - 1];
                    let update_fields = fields_part.split(',').map(|s| s.to_string()).collect();

                    ops.updates.push(UpdateOperation {
                        filter_by,
                        update_fields,
                    });
                } else {
                    // Handle simple "field" syntax (updates entire struct)
                    ops.updates.push(UpdateOperation {
                        filter_by: up.to_string(),
                        update_fields: vec![],
                    });
                }
            }

            current_pos = end_pos + 1;
        } 
        // Parse "delete(...)" operations
        else if clean_attr[current_pos..].starts_with("delete(") {
            let start_pos = current_pos + 7;
            let end_pos = clean_attr[start_pos..]
                .find(')')
                .map_or(clean_attr.len(), |pos| start_pos + pos);

            let delete_content = &clean_attr[start_pos..end_pos];
            ops.deletes = delete_content.split(',').map(|s| s.to_string()).collect();

            current_pos = end_pos + 1;
        } 
        // Parse "get(...)" operations
        else if clean_attr[current_pos..].starts_with("get(") {
            let start_pos = current_pos + 4;
            let end_pos = clean_attr[start_pos..]
                .find(')')
                .map_or(clean_attr.len(), |pos| start_pos + pos);

            let get_content = &clean_attr[start_pos..end_pos];
            ops.gets = get_content.split(',').map(|s| s.to_string()).collect();

            current_pos = end_pos + 1;
        } 
        // Parse "get_all" operation
        else if clean_attr[current_pos..].starts_with("get_all") {
            ops.get_all = true;
            current_pos += 7;
        } else {
            current_pos += 1;
        }
    }

    ops
}

/// Generates the implementation block with all requested CRUD methods
/// Takes the struct name, table name, and operations configuration to generate appropriate methods
fn generate_methods(
    struct_name: &syn::Ident,
    table_name: &str,
    ops: &DatabaseOperations,
) -> proc_macro2::TokenStream {
    let mut methods = proc_macro2::TokenStream::new();

    // Parse the table name into a Rust path for use in generated code
    let table_path = syn::parse_str::<syn::Path>(table_name)
        .unwrap_or_else(|_| syn::parse_str::<syn::Path>("schema::users").unwrap());

    // Generate create method if requested
    if ops.create {
        let create_method = quote! {
            pub async fn create(user: #struct_name) -> anyhow::Result<i32> {
                Database::query_wrapper(move |conn| {
                    diesel::insert_into(#table_path::table)
                        .values(user)
                        .returning(#table_path::id)
                        .get_result(conn)
                })
                .await
            }
        };
        methods.extend(create_method);
    }

    // Generate get_all method if requested
    if ops.get_all {
        let get_all_method = quote! {
            pub async fn get_all() -> anyhow::Result<Vec<#struct_name>> {
                Database::query_wrapper(move |conn| {
                    #table_path::table
                        .load::<#struct_name>(conn)
                })
                .await
            }
        };
        methods.extend(get_all_method);
    }

    // Generate get methods for each specified field
    for get_field in &ops.gets {
        let method_name = format_ident!("get_by_{}", get_field);
        let field_ident = format_ident!("{}", get_field);

        // Special handling for ID field (uses find() method)
        let get_method = if get_field == "id" {
            quote! {
                pub async fn #method_name(id: i32) -> anyhow::Result<Option<#struct_name>> {
                    Database::query_wrapper(move |conn| #table_path::table.find(id).first(conn).optional()).await
                }
            }
        } else {
            // Generic field filtering for non-ID fields
            quote! {
                pub async fn #method_name(#field_ident: String) -> anyhow::Result<Option<#struct_name>> {
                    Database::query_wrapper(move |conn| {
                        #table_path::table
                            .filter(#table_path::#field_ident.eq(#field_ident))
                            .first(conn)
                            .optional()
                    })
                    .await
                }
            }
        };

        methods.extend(get_method);
    }

    // Generate update methods for each update operation
    for update_op in &ops.updates {
        let filter_field = &update_op.filter_by;
        let filter_ident = format_ident!("{}", filter_field);

        // Case 1: Update entire struct (no specific fields specified)
        if update_op.update_fields.is_empty() {
            let method_name = format_ident!("update_by_{}", filter_field);

            let update_method = if filter_field == "id" {
                quote! {
                    pub async fn #method_name(new_user: #struct_name) -> anyhow::Result<()> {
                        if let Some(id) = new_user.id {
                            Database::query_wrapper(move |conn| {
                                diesel::update(#table_path::table.find(id))
                                    .set(&new_user)
                                    .execute(conn)
                            })
                            .await?;

                            return Ok(());
                        }

                        Err(anyhow::anyhow!("User ID is required"))
                    }
                }
            } else {
                quote! {
                    pub async fn #method_name(#filter_ident: String, new_user: #struct_name) -> anyhow::Result<()> {
                        Database::query_wrapper(move |conn| {
                            diesel::update(#table_path::table.filter(#table_path::#filter_ident.eq(#filter_ident)))
                                .set(&new_user)
                                .execute(conn)
                        })
                        .await?;

                        Ok(())
                    }
                }
            };

            methods.extend(update_method);
        } 
        // Case 2: Update single specific field
        else if update_op.update_fields.len() == 1 {
            let update_field = &update_op.update_fields[0];
            let method_name = format_ident!("update_{}_by_{}", update_field, filter_field);
            let update_ident = format_ident!("{}", update_field);

            let update_method = if filter_field == "id" {
                quote! {
                    pub async fn #method_name(id: i32, #update_ident: String) -> anyhow::Result<()> {
                        Database::query_wrapper(move |conn| {
                            diesel::update(#table_path::table.find(id))
                                .set(#table_path::#update_ident.eq(#update_ident))
                                .execute(conn)
                        })
                        .await?;

                        Ok(())
                    }
                }
            } else {
                quote! {
                    pub async fn #method_name(#filter_ident: String, #update_ident: String) -> anyhow::Result<()> {
                        Database::query_wrapper(move |conn| {
                            diesel::update(#table_path::table.filter(#table_path::#filter_ident.eq(#filter_ident)))
                                .set(#table_path::#update_ident.eq(#update_ident))
                                .execute(conn)
                        })
                        .await?;

                        Ok(())
                    }
                }
            };

            methods.extend(update_method);
        } 
        // Case 3: Update multiple specific fields
        else {
            let fields_str = update_op.update_fields.join("_and_");
            let method_name = format_ident!("update_{}_by_{}", fields_str, filter_field);

            let mut params = proc_macro2::TokenStream::new();
            let mut set_fields = proc_macro2::TokenStream::new();

            // Generate parameters for the method
            if filter_field == "id" {
                params.extend(quote! { id: i32, });
            } else {
                let filter_param = format_ident!("{}", filter_field);
                params.extend(quote! { #filter_param: String, });
            }

            // Generate parameters and set clauses for each field to update
            for (i, field) in update_op.update_fields.iter().enumerate() {
                let field_ident = format_ident!("{}", field);
                params.extend(quote! { #field_ident: String, });

                if i == 0 {
                    set_fields.extend(quote! { #table_path::#field_ident.eq(#field_ident) });
                } else {
                    set_fields.extend(quote! { , #table_path::#field_ident.eq(#field_ident) });
                }
            }

            let update_method = if filter_field == "id" {
                quote! {
                    pub async fn #method_name(#params) -> anyhow::Result<()> {
                        Database::query_wrapper(move |conn| {
                            diesel::update(#table_path::table.find(id))
                                .set((
                                    #set_fields
                                ))
                                .execute(conn)
                        })
                        .await?;

                        Ok(())
                    }
                }
            } else {
                let filter_ident = format_ident!("{}", filter_field);
                quote! {
                    pub async fn #method_name(#params) -> anyhow::Result<()> {
                        Database::query_wrapper(move |conn| {
                            diesel::update(#table_path::table.filter(#table_path::#filter_ident.eq(#filter_ident)))
                                .set((
                                    #set_fields
                                ))
                                .execute(conn)
                        })
                        .await?;

                        Ok(())
                    }
                }
            };

            methods.extend(update_method);
        }
    }

    // Generate delete methods for each specified field
    for delete_field in &ops.deletes {
        let method_name = format_ident!("delete_by_{}", delete_field);

        // Special handling for ID field (uses find() method)
        let delete_method = if delete_field == "id" {
            quote! {
                pub async fn #method_name(id: i32) -> anyhow::Result<()> {
                    Database::query_wrapper(move |conn| {
                        diesel::delete(#table_path::table.find(id)).execute(conn)
                    })
                    .await?;

                    Ok(())
                }
            }
        } else {
            // Generic field filtering for non-ID fields
            let field_ident = format_ident!("{}", delete_field);
            quote! {
                pub async fn #method_name(#field_ident: String) -> anyhow::Result<()> {
                    Database::query_wrapper(move |conn| {
                        diesel::delete(#table_path::table.filter(#table_path::#field_ident.eq(#field_ident)))
                            .execute(conn)
                    })
                    .await?;

                    Ok(())
                }
            }
        };

        methods.extend(delete_method);
    }

    // Return the complete implementation block
    quote! {
        impl #struct_name {
            #methods
        }
    }
}
