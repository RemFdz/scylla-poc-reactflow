use crate::server::DrawServerHandle;
use actix_ws::{Message, ProtocolError};
use futures_util::{FutureExt, StreamExt, pin_mut, select};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Shape {
    pub id: Option<Uuid>,
    pub x: f64,
    pub y: f64,
    pub rotation: i64,
    #[serde(rename = "isDragging")]
    pub is_dragging: bool,
    pub draggable: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "snake_case")]
pub enum CommandType {
    Init,
    UpdateShape,
    CreateShape,
    ClearShapes,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WebSocketCommand {
    #[serde(rename = "type")]
    pub r#type: CommandType,
    pub shape: Option<Shape>,
}

fn handle_message_from_ws(
    ws_res: Option<Result<Message, ProtocolError>>,
) -> Option<WebSocketCommand> {
    match ws_res {
        None => {
            return None;
        }
        Some(ref msg) => match msg {
            Ok(msg) => match msg {
                Message::Text(data) => {
                    let data = data.to_string();
                    let command: WebSocketCommand = serde_json::from_str(&data).unwrap();
                    return Some(command);
                }
                Message::Close(_) => {
                    return None;
                }
                _ => {
                    println!("Anything but not text: {:?}", msg);
                }
            },
            Err(_) => {
                println!("?????");
            }
        },
    }
    None
}

pub async fn chat_ws(
    draw_server: DrawServerHandle,
    mut session: actix_ws::Session,
    msg_stream: actix_ws::MessageStream,
) {
    let (conn_tx, mut conn_rx) = mpsc::unbounded_channel();
    let uuid = draw_server.connect(conn_tx).await;

    pin_mut!(msg_stream);
    let mut msg_stream = msg_stream.fuse();

    loop {
        select! {
            ws_res = msg_stream.next() => {
                match handle_message_from_ws(ws_res) {
                    None => {
                        break;
                    }
                    Some(command) => {
                        draw_server.send_action(command, uuid).await;
                    }
                }
            },
            server_res = conn_rx.recv().fuse() => {
                match server_res {
                    None => {
                        break;
                    }
                    Some(res) => {
                        if session.text(res).await.is_err() {
                            break;
                        }
                    }
                }
            },
        }
    }
    draw_server.disconnect(uuid);
}
