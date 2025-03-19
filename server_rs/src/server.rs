use crate::handler::{CommandType, EdgeInfo, MouseInfo, Shape, WebSocketCommand};
use serde_json::to_string;
use std::collections::HashMap;
use std::fmt::Debug;
use tokio::io;
use tokio::sync::{mpsc, oneshot};
use uuid::Uuid;

pub struct DrawServer {
    cmd_rx: mpsc::UnboundedReceiver<Command>,
    sessions: HashMap<Uuid, mpsc::UnboundedSender<String>>,
    shapes: HashMap<Uuid, Shape>,
    edges: Vec<EdgeInfo>,
}

#[derive(Debug)]
enum Command {
    Connect {
        conn_tx: mpsc::UnboundedSender<String>,
        res_tx: oneshot::Sender<Uuid>,
    },

    Disconnect {
        conn: Uuid,
    },

    Action {
        conn_id: Uuid,
        web_socket_command: WebSocketCommand,
    },
}

impl DrawServer {
    pub fn new() -> (Self, DrawServerHandle) {
        let (cmd_tx, cmd_rx) = mpsc::unbounded_channel();
        (
            DrawServer {
                cmd_rx,
                sessions: HashMap::new(),
                shapes: HashMap::new(),
                edges: Vec::new()
            },
            DrawServerHandle { cmd_tx },
        )
    }

    async fn connect(&mut self, tx: mpsc::UnboundedSender<String>) -> Uuid {
        let new_uuid = Uuid::new_v4();
        for shape in self.shapes.values_mut() {
            let command = WebSocketCommand {
                r#type: CommandType::CreateShape,
                shape: Some(shape.clone()),
                mouse_info: None,
                edge_info: None
            };
            let shape_str = to_string(&command).unwrap();
            tx.send(shape_str).unwrap()
        }
        for edge in &self.edges {
            let command = WebSocketCommand {
                r#type: CommandType::CreateEdge,
                shape: None,
                mouse_info: None,
                edge_info: Some(edge.clone())
            };
            let msg = to_string(&command).unwrap();
            tx.send(msg).unwrap();
        }
        self.sessions.insert(new_uuid.clone(), tx);
        new_uuid
    }

    async fn send_message(&self, msg: impl Into<String>) {
        let msg = msg.into();
        for (_, tx) in &self.sessions {
            tx.send(msg.clone()).unwrap();
        }
    }

    pub async fn run(mut self) -> io::Result<()> {
        while let Some(cmd) = self.cmd_rx.recv().await {
            match cmd {
                Command::Connect { conn_tx, res_tx } => {
                    let conn_id = self.connect(conn_tx).await;
                    let _ = res_tx.send(conn_id);
                }
                Command::Disconnect { conn } => {
                    self.disconnect(conn).await;
                }
                Command::Action {
                    conn_id,
                    web_socket_command,
                } => match web_socket_command.r#type {
                    CommandType::Init => {
                        unreachable!("Should not happen")
                    }
                    CommandType::UpdateShape => {
                        let Some(shape) = web_socket_command.shape else {
                            continue;
                        };
                        if shape.id.is_none() {
                            continue;
                        }
                        let id = shape.id.unwrap();
                        if !self.shapes.contains_key(id.as_ref()) {
                            continue;
                        }
                        self.shapes.insert(id, shape.clone());
                        let command = WebSocketCommand {
                            r#type: CommandType::UpdateShape,
                            shape: Some(shape.clone()),
                            mouse_info: None,
                            edge_info: None
                        };
                        self.send_message(to_string(&command)?).await;
                    }
                    CommandType::CreateShape => {
                        let uuid = Uuid::new_v4();
                        let new_shape: Shape = Shape {
                            id: Some(uuid),
                            ..web_socket_command.shape.unwrap()
                        };
                        self.shapes.insert(uuid, new_shape.clone());
                        let command = WebSocketCommand {
                            r#type: CommandType::CreateShape,
                            shape: Some(new_shape.clone()),
                            mouse_info: None,
                            edge_info: None
                        };
                        let res = to_string(&command)?;
                        self.send_message(res).await;
                    }
                    CommandType::ClearShapes => {
                        self.shapes.clear();
                        let command = WebSocketCommand {
                            r#type: CommandType::ClearShapes,
                            shape: None,
                            mouse_info: None,
                            edge_info: None
                        };
                        let command = to_string(&command)?;
                        self.send_message(command).await;
                    }
                    CommandType::UpdateMouse => {
                        let Some(mut mouse_info) = web_socket_command.mouse_info else {
                            continue;
                        };
                        mouse_info.conn_id = Some(conn_id);

                        let command = WebSocketCommand {
                            r#type: CommandType::UpdateMouse,
                            shape: None,
                            mouse_info: Some(mouse_info),
                            edge_info: None
                        };
                        let res = to_string(&command)?;
                        self.send_message(res).await;
                    }
                    CommandType::CreateEdge => {
                        let Some(edge_info) = web_socket_command.edge_info else {
                            continue;
                        };
                        self.edges.push(edge_info.clone());
                        let command = WebSocketCommand {
                            r#type: CommandType::CreateEdge,
                            shape: None,
                            mouse_info: None,
                            edge_info: Some(edge_info)
                        };
                        let res = to_string(&command)?;

                        self.send_message(res).await;
                    }
                    _ => {}
                },
            }
        }
        Ok(())
    }

    async fn disconnect(&mut self, conn_id: Uuid) {
        self.sessions.remove(&conn_id);
        let mouse_info = MouseInfo {
            x: 0.0,
            y: 0.0,
            conn_id: Some(conn_id)
        };
        let command = WebSocketCommand {
            r#type: CommandType::Disconnect,
            shape: None,
            mouse_info: Some(mouse_info),
            edge_info: None
        };

        let msg = to_string(&command).unwrap();
        for (_, tx) in &self.sessions {
            tx.send(msg.clone()).unwrap();
        }
    }
}

#[derive(Clone)]
pub struct DrawServerHandle {
    cmd_tx: mpsc::UnboundedSender<Command>,
}

impl DrawServerHandle {
    pub async fn connect(&self, conn_tx: mpsc::UnboundedSender<String>) -> Uuid {
        let (res_tx, res_rx) = oneshot::channel();

        self.cmd_tx
            .send(Command::Connect { conn_tx, res_tx })
            .unwrap();

        res_rx.await.unwrap()
    }

    pub fn disconnect(&self, conn: Uuid) {
        self.cmd_tx.send(Command::Disconnect { conn }).unwrap();
    }

    pub async fn send_action(&self, web_socket_command: WebSocketCommand, conn_id: Uuid) {
        self.cmd_tx
            .send(Command::Action {
                conn_id,
                web_socket_command,
            })
            .unwrap();
    }
}
