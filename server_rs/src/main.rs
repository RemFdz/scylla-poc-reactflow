mod handler;
mod server;

use crate::server::{DrawServer, DrawServerHandle};
use actix_web::middleware::Logger;
use actix_web::{App, Error, HttpRequest, HttpResponse, HttpServer, web};
use env_logger::Env;
use tokio::task::spawn_local;

async fn chat_ws(
    req: HttpRequest,
    stream: web::Payload,
    chat_server: web::Data<DrawServerHandle>,
) -> Result<HttpResponse, Error> {
    let (res, session, msg_stream) = actix_ws::handle(&req, stream)?;

    spawn_local(handler::chat_ws(
        (**chat_server).clone(),
        session,
        msg_stream,
    ));

    Ok(res)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    let (draw_server, draw_server_handle) = DrawServer::new();

    let _draw_server = tokio::spawn(draw_server.run());

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .app_data(web::Data::new(draw_server_handle.clone()))
            .service(web::resource("/ws").route(web::get().to(chat_ws)))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
