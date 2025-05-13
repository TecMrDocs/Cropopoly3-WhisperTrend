// @generated automatically by Diesel CLI.

diesel::table! {
    user (id) {
        id -> Int4,
        #[max_length = 255]
        name -> Varchar,
        #[max_length = 255]
        lastname -> Varchar,
        #[max_length = 255]
        password -> Varchar,
        #[max_length = 255]
        email -> Varchar,
        #[max_length = 20]
        phone -> Varchar,
    }
}
