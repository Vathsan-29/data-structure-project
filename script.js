"use strict";

/* =========================================================
   STUDENT COMMUNICATION SYSTEM
   Frontend demonstration of the project's C data structures
   ========================================================= */

const $ = id => document.getElementById(id);

function toast(message) {
  const box = document.createElement("div");
  box.className = "toast";
  box.textContent = message;
  $("toastContainer").appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

function showResult(id, message, error = false) {
  const box = $(id);
  box.textContent = message;
  box.classList.toggle("result-error", error);
  box.classList.toggle("result-success", !error);
}

function emptyMessage(element, message) {
  element.innerHTML = "";
  const p = document.createElement("div");
  p.className = "visual-empty";
  p.textContent = message;
  element.appendChild(p);
}

/* =========================================================
   NAVIGATION
   ========================================================= */

const pageNames = {
  dashboard: "Dashboard",
  students: "Student Management",
  messages: "Messaging Centre",
  groups: "Study Groups",
  network: "Student Network",
  notifications: "Notifications",
  hash: "Hash Table",
  bst: "Binary Search Tree",
  algorithms: "Algorithms Lab"
};

function navigate(page) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.toggle("active", section.id === `page-${page}`);
  });

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  $("pageTitle").textContent = pageNames[page] || "Dashboard";
  $("sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.page));
});

document.querySelectorAll("[data-goto]").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.goto));
});

$("menuButton").addEventListener("click", () => {
  $("sidebar").classList.add("open");
});

$("closeSidebar").addEventListener("click", () => {
  $("sidebar").classList.remove("open");
});

/* =========================================================
   1. STUDENT RECORDS — SINGLY LINKED LIST
   ========================================================= */

class StudentNode {
  constructor(id, name, email, department) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.department = department;
    this.next = null;
  }
}

class StudentLinkedList {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  find(id) {
    let current = this.head;

    while (current) {
      if (current.id === String(id)) return current;
      current = current.next;
    }

    return null;
  }

  insert(id, name, email, department) {
    if (this.length >= 50) {
      throw new Error("Maximum capacity of 50 students reached.");
    }

    if (this.find(id)) {
      throw new Error("This student ID already exists.");
    }

    const node = new StudentNode(id, name, email, department);

    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }

    this.length++;
  }

  delete(id) {
    let current = this.head;
    let previous = null;

    while (current) {
      if (current.id === String(id)) {
        if (previous) previous.next = current.next;
        else this.head = current.next;

        this.length--;
        return true;
      }

      previous = current;
      current = current.next;
    }

    return false;
  }

  toArray() {
    const result = [];
    let current = this.head;

    while (current) {
      result.push(current);
      current = current.next;
    }

    return result;
  }
}

const students = new StudentLinkedList();

function addStudent(id, name, email, department) {
  students.insert(id, name, email, department);
  refreshStudents();
}

function refreshStudents() {
  const list = students.toArray();
  const tbody = $("studentTableBody");

  tbody.innerHTML = "";

  list.forEach(student => {
    const tr = document.createElement("tr");

    const values = [
      student.id,
      student.name,
      student.email || "—",
      student.department || "—"
    ];

    values.forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    const action = document.createElement("td");
    const deleteButton = document.createElement("button");

    deleteButton.className = "table-action";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      if (students.delete(student.id)) {
        refreshStudents();
        refreshStudentOptions();
        renderGraph();
        renderMatrix();
        toast("Student record deleted.");
      }
    });

    action.appendChild(deleteButton);
    tr.appendChild(action);
    tbody.appendChild(tr);
  });

  $("studentCount").textContent = `${list.length} students`;

  renderStudentList();
  updateDashboard();
}

function renderStudentList() {
  const area = $("studentListVisual");
  area.innerHTML = "";

  const list = students.toArray();

  if (!list.length) {
    emptyMessage(area, "No student records available.");
    return;
  }

  const row = document.createElement("div");
  row.className = "node-row";

  list.forEach((student, index) => {
    const node = document.createElement("div");
    node.className = "visual-node";
    node.textContent = student.id;

    const label = document.createElement("small");
    label.textContent = student.name;
    label.style.display = "block";
    node.appendChild(label);

    row.appendChild(node);

    if (index !== list.length - 1) {
      const arrow = document.createElement("span");
      arrow.className = "node-arrow";
      arrow.textContent = "→";
      row.appendChild(arrow);
    }
  });

  const end = document.createElement("span");
  end.className = "node-arrow";
  end.textContent = "→ NULL";
  row.appendChild(end);

  area.appendChild(row);
}

$("studentForm").addEventListener("submit", event => {
  event.preventDefault();

  try {
    addStudent(
      $("studentId").value.trim(),
      $("studentName").value.trim(),
      $("studentEmail").value.trim(),
      $("studentDepartment").value.trim()
    );

    $("studentForm").reset();
    refreshStudentOptions();
    renderGraph();
    renderMatrix();
    toast("Student added successfully.");
  } catch (error) {
    toast(error.message);
  }
});

$("studentSearch").addEventListener("input", event => {
  const query = event.target.value.toLowerCase();

  document.querySelectorAll("#studentTableBody tr").forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(query)
      ? ""
      : "none";
  });
});

/* =========================================================
   2. MESSAGING — QUEUE, STACK AND DOUBLY LINKED LIST
   ========================================================= */

let messageCounter = 0;

class MessageNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class MessageQueue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.length = 0;
  }

  enqueue(data) {
    const node = new MessageNode(data);

    if (!this.rear) {
      this.front = this.rear = node;
    } else {
      this.rear.next = node;
      this.rear = node;
    }

    this.length++;
  }

  dequeue() {
    if (!this.front) return null;

    const data = this.front.data;
    this.front = this.front.next;

    if (!this.front) this.rear = null;

    this.length--;
    return data;
  }

  removeById(id) {
    let current = this.front;
    let previous = null;

    while (current) {
      if (current.data.id === id) {
        if (previous) previous.next = current.next;
        else this.front = current.next;

        if (current === this.rear) this.rear = previous;

        this.length--;
        return true;
      }

      previous = current;
      current = current.next;
    }

    return false;
  }

  toArray() {
    const result = [];
    let current = this.front;

    while (current) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }
}

class UndoStack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop() || null;
  }

  peek() {
    return this.items[this.items.length - 1] || null;
  }
}

class ChatNode {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class ChatHistory {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  append(data) {
    const node = new ChatNode(data);

    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }

    this.length++;
  }

  removeLast() {
    if (!this.tail) return null;

    const data = this.tail.data;
    this.tail = this.tail.prev;

    if (this.tail) this.tail.next = null;
    else this.head = null;

    this.length--;
    return data;
  }

  toArray() {
    const result = [];
    let current = this.head;

    while (current) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }
}

const messageQueue = new MessageQueue();
const undoStack = new UndoStack();
const chatHistory = new ChatHistory();

let chatIndex = -1;

function createMessage(sender, receiver, text) {
  return {
    id: ++messageCounter,
    sender,
    receiver,
    text,
    time: new Date().toLocaleTimeString()
  };
}

function renderQueue() {
  const area = $("messageQueueVisual");
  area.innerHTML = "";

  const messages = messageQueue.toArray();

  if (!messages.length) {
    emptyMessage(area, "Queue is empty.");
    return;
  }

  messages.forEach((message, index) => {
    const node = document.createElement("div");
    node.className = "stack-item";
    node.textContent = `${message.sender} → ${message.receiver}: ${message.text}`;

    const position = document.createElement("small");
    position.textContent = index === 0 ? "FRONT" : "QUEUE";
    position.style.display = "block";
    node.appendChild(position);

    area.appendChild(node);
  });

  const rear = document.createElement("small");
  rear.textContent = "Messages are processed from FRONT to REAR.";
  area.appendChild(rear);
}

function renderUndoStack() {
  const area = $("undoStackVisual");
  area.innerHTML = "";

  if (!undoStack.items.length) {
    emptyMessage(area, "Undo stack is empty.");
    return;
  }

  [...undoStack.items].reverse().forEach((message, index) => {
    const node = document.createElement("div");
    node.className = "stack-item";
    node.textContent = `${message.sender}: ${message.text}`;

    if (index === 0) {
      const top = document.createElement("small");
      top.textContent = "TOP";
      top.style.display = "block";
      node.appendChild(top);
    }

    area.appendChild(node);
  });
}

function renderChatHistory() {
  const messages = chatHistory.toArray();
  const area = $("chatHistoryVisual");

  area.innerHTML = "";

  if (!messages.length) {
    chatIndex = -1;
    $("chatPosition").textContent = "No messages";
    emptyMessage(area, "No processed messages in chat history.");
    return;
  }

  chatIndex = Math.min(chatIndex, messages.length - 1);
  if (chatIndex < 0) chatIndex = 0;

  const message = messages[chatIndex];
  const card = document.createElement("div");
  card.className = "chat-message";

  const title = document.createElement("strong");
  title.textContent = `${message.sender} → ${message.receiver}`;

  const body = document.createElement("p");
  body.textContent = message.text;

  const time = document.createElement("small");
  time.textContent = message.time;

  card.append(title, body, time);
  area.appendChild(card);

  $("chatPosition").textContent =
    `Message ${chatIndex + 1} of ${messages.length}`;
}

function refreshMessaging() {
  renderQueue();
  renderUndoStack();
  renderChatHistory();
  updateDashboard();
}

function refreshStudentOptions() {
  const list = students.toArray();

  const selects = [
    "messageSender",
    "messageReceiver",
    "connectionFrom",
    "connectionTo",
    "graphStart",
    "pathFrom",
    "pathTo"
  ];

  selects.forEach(id => {
    const select = $(id);
    if (!select) return;

    const previous = select.value;
    select.innerHTML = "";

    list.forEach(student => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = `${student.name} (${student.id})`;
      select.appendChild(option);
    });

    if (list.some(student => student.id === previous)) {
      select.value = previous;
    }
  });
}

$("messageForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!students.length) {
    toast("Add student records before composing messages.");
    return;
  }

  const sender = $("messageSender").value;
  const receiver = $("messageReceiver").value;
  const text = $("messageText").value.trim();

  if (sender === receiver) {
    toast("Sender and receiver must be different.");
    return;
  }

  if (!text) return;

  if (messageQueue.length >= 50) {
    toast("Message queue capacity of 50 reached.");
    return;
  }

  const message = createMessage(sender, receiver, text);

  messageQueue.enqueue(message);
  undoStack.push(message);

  $("messageText").value = "";
  refreshMessaging();
  toast("Message added to queue.");
});

$("processMessage").addEventListener("click", () => {
  const message = messageQueue.dequeue();

  if (!message) {
    toast("No pending messages.");
    return;
  }

  chatHistory.append(message);
  chatIndex = chatHistory.length - 1;

  refreshMessaging();
  toast("Message processed and added to chat history.");
});

$("undoMessage").addEventListener("click", () => {
  const message = undoStack.pop();

  if (!message) {
    toast("Nothing available to undo.");
    return;
  }

  const removedFromQueue = messageQueue.removeById(message.id);

  if (!removedFromQueue) {
    undoStack.push(message);
    toast("This message has already been processed.");
    return;
  }

  refreshMessaging();
  toast("Latest pending message removed.");
});

$("previousChat").addEventListener("click", () => {
  if (chatIndex > 0) {
    chatIndex--;
    renderChatHistory();
  }
});

$("nextChat").addEventListener("click", () => {
  if (chatIndex < chatHistory.length - 1) {
    chatIndex++;
    renderChatHistory();
  }
});

/* =========================================================
   3. STUDY GROUP — CIRCULAR LINKED LIST
   ========================================================= */

class CircularNode {
  constructor(name) {
    this.name = name;
    this.next = null;
  }
}

class CircularLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.length = 0;
  }

  append(name) {
    const node = new CircularNode(name);

    if (!this.head) {
      this.head = this.tail = node;
      node.next = node;
      this.current = node;
    } else {
      node.next = this.head;
      this.tail.next = node;
      this.tail = node;
    }

    this.length++;
  }

  nextMember() {
    if (!this.current) return null;
    this.current = this.current.next;
    return this.current;
  }

  previousMember() {
    if (!this.current) return null;

    let node = this.head;

    while (node.next !== this.current) {
      node = node.next;
      if (node === this.head) break;
    }

    this.current = node;
    return this.current;
  }

  removeCurrent() {
    if (!this.current) return null;

    const removed = this.current;
    let previous = this.tail;

    while (previous.next !== removed) {
      previous = previous.next;
    }

    if (this.length === 1) {
      this.head = this.tail = this.current = null;
    } else {
      previous.next = removed.next;

      if (removed === this.head) this.head = removed.next;
      if (removed === this.tail) this.tail = previous;

      this.current = removed.next;
      this.tail.next = this.head;
    }

    this.length--;
    return removed.name;
  }

  toArray() {
    const result = [];
    if (!this.head) return result;

    let node = this.head;

    do {
      result.push(node);
      node = node.next;
    } while (node !== this.head && result.length <= this.length);

    return result;
  }
}

const studyGroup = new CircularLinkedList();

function renderStudyGroup() {
  const area = $("circularGroupVisual");
  area.innerHTML = "";

  const members = studyGroup.toArray();

  if (!members.length) {
    emptyMessage(area, "No study group members.");
    $("currentMember").textContent = "No members";
    updateDashboard();
    return;
  }

  const row = document.createElement("div");
  row.className = "node-row";

  members.forEach((member, index) => {
    const node = document.createElement("div");
    node.className = "visual-node";
    node.textContent = member.name;

    if (member === studyGroup.current) {
      node.style.border = "2px solid #a71920";
    }

    row.appendChild(node);

    const arrow = document.createElement("span");
    arrow.className = "node-arrow";
    arrow.textContent = index === members.length - 1 ? "↺" : "→";
    row.appendChild(arrow);
  });

  area.appendChild(row);

  $("currentMember").textContent =
    studyGroup.current ? `Current: ${studyGroup.current.name}` : "No members";

  updateDashboard();
}

$("groupForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("groupMember").value.trim();
  if (!name) return;

  if (studyGroup.length >= 50) {
    toast("Study group capacity reached.");
    return;
  }

  studyGroup.append(name);
  $("groupMember").value = "";

  renderStudyGroup();
  toast("Member added to circular linked list.");
});

$("nextMember").addEventListener("click", () => {
  if (!studyGroup.nextMember()) {
    toast("No group members available.");
    return;
  }
  renderStudyGroup();
});

$("previousMember").addEventListener("click", () => {
  if (!studyGroup.previousMember()) {
    toast("No group members available.");
    return;
  }
  renderStudyGroup();
});

$("removeGroupMember").addEventListener("click", () => {
  if (!studyGroup.removeCurrent()) {
    toast("No current member to remove.");
    return;
  }

  renderStudyGroup();
  toast("Current member removed.");
});

/* =========================================================
   4. STUDENT NETWORK — UNDIRECTED GRAPH
   Adjacency matrix, BFS, DFS and shortest path
   ========================================================= */

class StudentGraph {
  constructor() {
    this.vertices = [];
    this.matrix = [];
  }

  addVertex(id) {
    if (this.vertices.includes(id)) return;

    this.vertices.push(id);

    this.matrix.forEach(row => row.push(0));
    this.matrix.push(new Array(this.vertices.length).fill(0));
  }

  removeVertex(id) {
    const index = this.vertices.indexOf(id);
    if (index === -1) return;

    this.vertices.splice(index, 1);
    this.matrix.splice(index, 1);
    this.matrix.forEach(row => row.splice(index, 1));
  }

  addEdge(a, b) {
    const i = this.vertices.indexOf(a);
    const j = this.vertices.indexOf(b);

    if (i === -1 || j === -1) {
      throw new Error("Both students must exist.");
    }

    if (i === j) throw new Error("A student cannot connect to themselves.");

    this.matrix[i][j] = 1;
    this.matrix[j][i] = 1;
  }

  bfs(start) {
    const startIndex = this.vertices.indexOf(start);
    if (startIndex === -1) return [];

    const visited = new Set([startIndex]);
    const queue = [startIndex];
    const order = [];

    while (queue.length) {
      const current = queue.shift();
      order.push(this.vertices[current]);

      for (let i = 0; i < this.vertices.length; i++) {
        if (this.matrix[current][i] && !visited.has(i)) {
          visited.add(i);
          queue.push(i);
        }
      }
    }

    return order;
  }

  dfs(start) {
    const startIndex = this.vertices.indexOf(start);
    if (startIndex === -1) return [];

    const visited = new Set();
    const order = [];

    const visit = index => {
      visited.add(index);
      order.push(this.vertices[index]);

      for (let i = 0; i < this.vertices.length; i++) {
        if (this.matrix[index][i] && !visited.has(i)) {
          visit(i);
        }
      }
    };

    visit(startIndex);
    return order;
  }

  shortestPath(start, end) {
    const startIndex = this.vertices.indexOf(start);
    const endIndex = this.vertices.indexOf(end);

    if (startIndex === -1 || endIndex === -1) return null;

    const queue = [startIndex];
    const previous = new Array(this.vertices.length).fill(-1);
    const visited = new Set([startIndex]);

    while (queue.length) {
      const current = queue.shift();

      if (current === endIndex) break;

      for (let i = 0; i < this.vertices.length; i++) {
        if (this.matrix[current][i] && !visited.has(i)) {
          visited.add(i);
          previous[i] = current;
          queue.push(i);
        }
      }
    }

    if (!visited.has(endIndex)) return null;

    const path = [];
    let current = endIndex;

    while (current !== -1) {
      path.unshift(this.vertices[current]);
      current = previous[current];
    }

    return path;
  }
}

const graph = new StudentGraph();

function syncGraphVertices() {
  const ids = students.toArray().map(student => student.id);

  graph.vertices.slice().forEach(id => {
    if (!ids.includes(id)) graph.removeVertex(id);
  });

  ids.forEach(id => graph.addVertex(id));
}

function renderGraph() {
  syncGraphVertices();

  const area = $("graphVisual");
  area.innerHTML = "";

  const count = graph.vertices.length;

  if (!count) {
    emptyMessage(area, "Add students to create a network.");
    return;
  }

  const width = Math.max(400, count * 85);
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width * .35, 115);

  const positions = graph.vertices.map((id, i) => {
    const angle = (2 * Math.PI * i / count) - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      if (!graph.matrix[i][j]) continue;

      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", positions[i].x);
      line.setAttribute("y1", positions[i].y);
      line.setAttribute("x2", positions[j].x);
      line.setAttribute("y2", positions[j].y);
      line.setAttribute("class", "graph-edge");
      svg.appendChild(line);
    }
  }

  graph.vertices.forEach((id, index) => {
    const point = positions[index];

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", 21);
    circle.setAttribute("class", "graph-node");
    svg.appendChild(circle);

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", point.x);
    label.setAttribute("y", point.y);
    label.setAttribute("class", "graph-node-label");
    label.textContent = id;
    svg.appendChild(label);
  });

  area.appendChild(svg);
  renderMatrix();
}

function renderMatrix() {
  const area = $("adjacencyMatrix");

  if (!graph.vertices.length) {
    area.textContent = "No vertices in the graph.";
    return;
  }

  const table = document.createElement("table");
  const head = document.createElement("tr");

  ["Student", ...graph.vertices].forEach(value => {
    const th = document.createElement("th");
    th.textContent = value;
    head.appendChild(th);
  });

  table.appendChild(head);

  graph.matrix.forEach((row, i) => {
    const tr = document.createElement("tr");
    const label = document.createElement("td");
    label.textContent = graph.vertices[i];
    tr.appendChild(label);

    row.forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  area.innerHTML = "";
  area.appendChild(table);
}

$("connectionForm").addEventListener("submit", event => {
  event.preventDefault();

  try {
    graph.addEdge($("connectionFrom").value, $("connectionTo").value);
    renderGraph();
    toast("Student connection added.");
  } catch (error) {
    toast(error.message);
  }
});

$("runBFS").addEventListener("click", () => {
  const result = graph.bfs($("graphStart").value);
  showResult("graphTraversalResult",
    `BFS traversal: ${result.join(" → ") || "No vertices"}`
  );
});

$("runDFS").addEventListener("click", () => {
  const result = graph.dfs($("graphStart").value);
  showResult("graphTraversalResult",
    `DFS traversal: ${result.join(" → ") || "No vertices"}`
  );
});

$("findPath").addEventListener("click", () => {
  const start = $("pathFrom").value;
  const end = $("pathTo").value;
  const path = graph.shortestPath(start, end);

  if (!path) {
    showResult("shortestPathResult", "No path exists between these students.", true);
    return;
  }

  showResult(
    "shortestPathResult",
    `Shortest path: ${path.join(" → ")} | Steps: ${path.length - 1}`
  );
});

/* =========================================================
   5. PRIORITY NOTIFICATIONS — MAX HEAP
   ========================================================= */

class MaxHeap {
  constructor() {
    this.items = [];
  }

  insert(item) {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.items[parent].priority >= this.items[index].priority) break;

      [this.items[parent], this.items[index]] =
        [this.items[index], this.items[parent]];

      index = parent;
    }
  }

  extractMax() {
    if (!this.items.length) return null;

    if (this.items.length === 1) return this.items.pop();

    const maximum = this.items[0];
    this.items[0] = this.items.pop();
    this.heapifyDown(0);

    return maximum;
  }

  heapifyDown(index) {
    const size = this.items.length;

    while (true) {
      let largest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < size &&
          this.items[left].priority > this.items[largest].priority) {
        largest = left;
      }

      if (right < size &&
          this.items[right].priority > this.items[largest].priority) {
        largest = right;
      }

      if (largest === index) break;

      [this.items[index], this.items[largest]] =
        [this.items[largest], this.items[index]];

      index = largest;
    }
  }

  peek() {
    return this.items[0] || null;
  }
}

const notifications = new MaxHeap();
let notificationId = 0;

function renderHeap() {
  const tree = $("heapTreeVisual");
  const array = $("heapArrayVisual");
  const list = $("notificationList");

  tree.innerHTML = "";
  array.innerHTML = "";
  list.innerHTML = "";

  const items = notifications.items;

  if (!items.length) {
    emptyMessage(tree, "Heap is empty.");
    emptyMessage(array, "No array values.");
    emptyMessage(list, "No notifications.");
    updateDashboard();
    return;
  }

  const levels = Math.ceil(Math.log2(items.length + 1));

  for (let level = 0; level < levels; level++) {
    const start = Math.pow(2, level) - 1;
    const end = Math.min(Math.pow(2, level + 1) - 1, items.length);

    const row = document.createElement("div");
    row.className = "heap-level";

    for (let i = start; i < end; i++) {
      const node = document.createElement("div");
      node.className = "heap-node";
      node.textContent = items[i].priority;
      node.title = items[i].text;
      row.appendChild(node);
    }

    tree.appendChild(row);
  }

  items.forEach((item, index) => {
    const cell = document.createElement("div");
    cell.className = "heap-array-item";
    cell.textContent = `${index}: ${item.priority}`;
    array.appendChild(cell);

    const card = document.createElement("div");
    card.className = "notification-item";

    const badge = document.createElement("span");
    badge.className = "priority-badge";
    badge.textContent = `P${item.priority}`;

    const text = document.createElement("p");
    text.textContent = item.text;

    card.append(badge, text);
    list.appendChild(card);
  });

  updateDashboard();
}

$("notificationForm").addEventListener("submit", event => {
  event.preventDefault();

  const text = $("notificationText").value.trim();
  const priority = Number($("notificationPriority").value);

  if (!text || priority < 1 || priority > 10 || !Number.isInteger(priority)) {
    toast("Enter a message and priority from 1 to 10.");
    return;
  }

  if (notifications.items.length >= 50) {
    toast("Notification capacity reached.");
    return;
  }

  notifications.insert({
    id: ++notificationId,
    text,
    priority
  });

  $("notificationForm").reset();
  renderHeap();
  toast("Notification inserted into max heap.");
});

$("extractPriority").addEventListener("click", () => {
  const item = notifications.extractMax();

  if (!item) {
    toast("Heap is empty.");
    return;
  }

  renderHeap();
  toast(`Extracted priority ${item.priority}: ${item.text}`);
});

$("peekPriority").addEventListener("click", () => {
  const item = notifications.peek();

  if (!item) {
    toast("Heap is empty.");
    return;
  }

  toast(`Highest priority: ${item.priority} — ${item.text}`);
});

/* =========================================================
   6. HASH TABLE — SIZE 101, MODULO AND LINEAR PROBING
   ========================================================= */

const HASH_SIZE = 101;
const hashTable = new Array(HASH_SIZE).fill(null);

function hashFunction(key) {
  return Number(key) % HASH_SIZE;
}

function hashInsert(key) {
  key = Number(key);

  if (!Number.isInteger(key) || key < 0) {
    throw new Error("Enter a non-negative integer key.");
  }

  let index = hashFunction(key);
  const start = index;
  let probes = 0;

  while (probes < HASH_SIZE) {
    if (hashTable[index] === key) {
      return { success: false, message: `Key ${key} already exists at slot ${index}.` };
    }

    if (hashTable[index] === null || hashTable[index] === "DELETED") {
      hashTable[index] = key;
      return {
        success: true,
        message: `Key ${key} inserted at slot ${index}. Initial hash: ${start}. Probes: ${probes}.`
      };
    }

    index = (index + 1) % HASH_SIZE;
    probes++;
  }

  return { success: false, message: "Hash table is full." };
}

function hashSearch(key) {
  key = Number(key);

  if (!Number.isInteger(key) || key < 0) {
    return { found: false, message: "Enter a valid non-negative integer." };
  }

  let index = hashFunction(key);
  const start = index;
  let probes = 0;

  while (probes < HASH_SIZE) {
    const value = hashTable[index];

    if (value === null) {
      return {
        found: false,
        message: `Key not found. Search stopped at empty slot ${index}.`
      };
    }

    if (value === key) {
      return {
        found: true,
        message: `Key ${key} found at slot ${index}. Initial hash: ${start}. Probes: ${probes}.`,
        index
      };
    }

    index = (index + 1) % HASH_SIZE;
    probes++;
  }

  return { found: false, message: "Key not found after full table scan." };
}

function hashDelete(key) {
  const result = hashSearch(key);

  if (!result.found) return result;

  hashTable[result.index] = "DELETED";

  return {
    found: true,
    message: `Key ${key} deleted from slot ${result.index}.`
  };
}

function renderHashTable(highlight = -1) {
  const area = $("hashTableVisual");
  area.innerHTML = "";

  hashTable.forEach((value, index) => {
    const slot = document.createElement("div");
    slot.className = "hash-slot";

    if (value !== null && value !== "DELETED") {
      slot.classList.add("occupied");
    }

    if (index === highlight) slot.classList.add("highlight");

    const number = document.createElement("small");
    number.textContent = index;

    const content = document.createElement("strong");
    content.textContent = value === null ? "—" :
      value === "DELETED" ? "DEL" : value;

    slot.append(number, content);
    area.appendChild(slot);
  });
}

$("hashForm").addEventListener("submit", event => {
  event.preventDefault();

  try {
    const result = hashInsert($("hashKey").value);
    showResult("hashResult", result.message, !result.success);
    renderHashTable();
  } catch (error) {
    showResult("hashResult", error.message, true);
  }
});

$("searchHash").addEventListener("click", () => {
  const result = hashSearch($("hashKey").value);
  showResult("hashResult", result.message, !result.found);
  renderHashTable(result.index ?? -1);
});

$("deleteHash").addEventListener("click", () => {
  const result = hashDelete($("hashKey").value);
  showResult("hashResult", result.message, !result.found);
  renderHashTable();
});

/* =========================================================
   7. BINARY SEARCH TREE
   ========================================================= */

class BSTNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const node = new BSTNode(value);

    if (!this.root) {
      this.root = node;
      return true;
    }

    let current = this.root;

    while (true) {
      if (value === current.value) return false;

      if (value < current.value) {
        if (!current.left) {
          current.left = node;
          return true;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = node;
          return true;
        }
        current = current.right;
      }
    }
  }

  search(value) {
    let current = this.root;

    while (current) {
      if (value === current.value) return current;
      current = value < current.value ? current.left : current.right;
    }

    return null;
  }

  inorder(node = this.root, result = []) {
    if (!node) return result;
    this.inorder(node.left, result);
    result.push(node.value);
    this.inorder(node.right, result);
    return result;
  }

  preorder(node = this.root, result = []) {
    if (!node) return result;
    result.push(node.value);
    this.preorder(node.left, result);
    this.preorder(node.right, result);
    return result;
  }

  postorder(node = this.root, result = []) {
    if (!node) return result;
    this.postorder(node.left, result);
    this.postorder(node.right, result);
    result.push(node.value);
    return result;
  }
}

const bst = new BinarySearchTree();

function renderBST(foundValue = null) {
  const area = $("bstVisual");
  area.innerHTML = "";

  if (!bst.root) {
    emptyMessage(area, "Insert student IDs to build the tree.");
    return;
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");

  const depth = node => {
    if (!node) return 0;
    return 1 + Math.max(depth(node.left), depth(node.right));
  };

  const treeDepth = depth(bst.root);
  const width = Math.max(500, Math.pow(2, Math.min(treeDepth, 6)) * 65);
  const height = Math.max(190, treeDepth * 85 + 35);

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  function draw(node, x, y, gap) {
    if (!node) return;

    const childY = y + 78;

    if (node.left) {
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", y + 15);
      line.setAttribute("x2", x - gap);
      line.setAttribute("y2", childY - 15);
      line.setAttribute("class", "tree-line");
      svg.appendChild(line);
    }

    if (node.right) {
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", y + 15);
      line.setAttribute("x2", x + gap);
      line.setAttribute("y2", childY - 15);
      line.setAttribute("class", "tree-line");
      svg.appendChild(line);
    }

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 19);
    circle.setAttribute("class",
      node.value === foundValue ? "tree-circle found" : "tree-circle");
    svg.appendChild(circle);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("class", "tree-text");
    text.textContent = node.value;
    svg.appendChild(text);

    draw(node.left, x - gap, childY, Math.max(28, gap / 2));
    draw(node.right, x + gap, childY, Math.max(28, gap / 2));
  }

  draw(bst.root, width / 2, 30, width / 4);
  area.appendChild(svg);
}

$("bstForm").addEventListener("submit", event => {
  event.preventDefault();

  const value = Number($("bstValue").value);

  if (!Number.isInteger(value)) {
    toast("Enter a valid student ID.");
    return;
  }

  if (!bst.insert(value)) {
    toast("This value already exists in the BST.");
    return;
  }

  renderBST();
  $("bstValue").value = "";
  toast("Value inserted into BST.");
});

$("searchBST").addEventListener("click", () => {
  const value = Number($("bstValue").value);
  const found = bst.search(value);

  if (found) {
    renderBST(value);
    showResult("bstResult", `Student ID ${value} found in the Binary Search Tree.`);
  } else {
    renderBST();
    showResult("bstResult", `Student ID ${value} not found.`, true);
  }
});

$("inorderBST").addEventListener("click", () => {
  showResult("bstResult", `Inorder (Left → Root → Right): ${bst.inorder().join(" → ") || "Empty tree"}`);
});

$("preorderBST").addEventListener("click", () => {
  showResult("bstResult", `Preorder (Root → Left → Right): ${bst.preorder().join(" → ") || "Empty tree"}`);
});

$("postorderBST").addEventListener("click", () => {
  showResult("bstResult", `Postorder (Left → Right → Root): ${bst.postorder().join(" → ") || "Empty tree"}`);
});

/* =========================================================
   8. SORTING ALGORITHMS
   Selection Sort, Insertion Sort and Radix Sort
   ========================================================= */

function readArray() {
  const values = $("arrayInput").value
    .split(",")
    .map(value => value.trim())
    .filter(Boolean)
    .map(Number);

  if (!values.length || values.some(value => !Number.isFinite(value))) {
    throw new Error("Enter valid numbers separated by commas.");
  }

  return values;
}

function selectionSort(input) {
  const array = [...input];
  let comparisons = 0;
  let swaps = 0;
  const steps = [];

  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < array.length; j++) {
      comparisons++;

      if (array[j] < array[minIndex]) minIndex = j;
    }

    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      swaps++;
    }

    steps.push([...array]);
  }

  return { array, comparisons, swaps, steps };
}

function insertionSort(input) {
  const array = [...input];
  let comparisons = 0;
  let shifts = 0;
  const steps = [];

  for (let i = 1; i < array.length; i++) {
    const key = array[i];
    let j = i - 1;

    while (j >= 0) {
      comparisons++;

      if (array[j] <= key) break;

      array[j + 1] = array[j];
      shifts++;
      j--;
    }

    array[j + 1] = key;
    steps.push([...array]);
  }

  return { array, comparisons, swaps: shifts, steps };
}

function radixSort(input) {
  if (input.some(value => !Number.isInteger(value) || value < 0)) {
    throw new Error("Radix sort requires non-negative integers.");
  }

  const array = [...input];
  const max = Math.max(...array);
  const steps = [];

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const output = new Array(array.length);
    const count = new Array(10).fill(0);

    for (const value of array) {
      count[Math.floor(value / exp) % 10]++;
    }

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    for (let i = array.length - 1; i >= 0; i--) {
      const digit = Math.floor(array[i] / exp) % 10;
      output[--count[digit]] = array[i];
    }

    for (let i = 0; i < array.length; i++) {
      array[i] = output[i];
    }

    steps.push([...array]);
  }

  return { array, steps };
}

function displaySortResult(result, name) {
  const steps = result.steps || [];
  const details = steps.map((step, i) =>
    `Pass ${i + 1}: ${step.join(", ")}`
  ).join("\n");

  const stats = result.comparisons !== undefined
    ? `Comparisons: ${result.comparisons} | Swaps/Shifts: ${result.swaps}`
    : `Digit passes: ${steps.length}`;

  showResult(
    "sortResult",
    `${name}\nSorted array: ${result.array.join(", ")}\n${stats}\n\n${details || "No passes required."}`
  );
}

$("selectionSort").addEventListener("click", () => {
  try {
    displaySortResult(selectionSort(readArray()), "Selection Sort");
  } catch (error) {
    showResult("sortResult", error.message, true);
  }
});

$("insertionSort").addEventListener("click", () => {
  try {
    displaySortResult(insertionSort(readArray()), "Insertion Sort");
  } catch (error) {
    showResult("sortResult", error.message, true);
  }
});

$("radixSort").addEventListener("click", () => {
  try {
    displaySortResult(radixSort(readArray()), "Radix Sort");
  } catch (error) {
    showResult("sortResult", error.message, true);
  }
});

/* =========================================================
   9. BINARY SEARCH
   ========================================================= */

$("runBinarySearch").addEventListener("click", () => {
  try {
    const array = readArray().sort((a, b) => a - b);
    const target = Number($("binarySearchValue").value);

    if (!$("binarySearchValue").value.trim()) {
      throw new Error("Enter a value to search.");
    }

    let low = 0;
    let high = array.length - 1;
    let found = -1;
    const steps = [];

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      steps.push(`Low=${low}, High=${high}, Mid=${mid}, Value=${array[mid]}`);

      if (array[mid] === target) {
        found = mid;
        break;
      }

      if (array[mid] < target) low = mid + 1;
      else high = mid - 1;
    }

    showResult(
      "binarySearchResult",
      `Sorted array: ${array.join(", ")}\n` +
      (found >= 0
        ? `Value ${target} found at index ${found}.`
        : `Value ${target} not found.`) +
      `\n\n${steps.join("\n")}`,
      found < 0
    );
  } catch (error) {
    showResult("binarySearchResult", error.message, true);
  }
});

/* =========================================================
   10. INFIX TO POSTFIX AND EXPRESSION EVALUATION
   ========================================================= */

function tokenize(expression) {
  const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/]/g);

  if (!tokens || tokens.join("") !== expression.replace(/\s/g, "")) {
    throw new Error("Invalid expression. Use numbers and + - * / parentheses.");
  }

  return tokens;
}

function infixToPostfix(expression) {
  const tokens = tokenize(expression);
  const output = [];
  const stack = [];

  const precedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2
  };

  let expectNumber = true;

  for (const token of tokens) {
    if (!isNaN(token)) {
      if (!expectNumber) throw new Error("Invalid expression.");
      output.push(token);
      expectNumber = false;
    } else if (token === "(") {
      if (!expectNumber) throw new Error("Invalid expression.");
      stack.push(token);
    } else if (token === ")") {
      if (expectNumber) throw new Error("Invalid expression.");

      while (stack.length && stack[stack.length - 1] !== "(") {
        output.push(stack.pop());
      }

      if (!stack.length) throw new Error("Mismatched parentheses.");

      stack.pop();
      expectNumber = false;
    } else {
      if (expectNumber) throw new Error("Invalid expression.");

      while (
        stack.length &&
        stack[stack.length - 1] !== "(" &&
        precedence[stack[stack.length - 1]] >= precedence[token]
      ) {
        output.push(stack.pop());
      }

      stack.push(token);
      expectNumber = true;
    }
  }

  if (expectNumber) throw new Error("Expression cannot end with an operator.");

  while (stack.length) {
    const operator = stack.pop();

    if (operator === "(") throw new Error("Mismatched parentheses.");

    output.push(operator);
  }

  return output;
}

function evaluatePostfix(postfix) {
  const stack = [];

  for (const token of postfix) {
    if (!isNaN(token)) {
      stack.push(Number(token));
      continue;
    }

    if (stack.length < 2) throw new Error("Invalid postfix expression.");

    const b = stack.pop();
    const a = stack.pop();

    let result;

    switch (token) {
      case "+": result = a + b; break;
      case "-": result = a - b; break;
      case "*": result = a * b; break;
      case "/":
        if (b === 0) throw new Error("Division by zero is not allowed.");
        result = a / b;
        break;
      default:
        throw new Error("Unknown operator.");
    }

    stack.push(result);
  }

  if (stack.length !== 1) throw new Error("Invalid expression.");

  return stack[0];
}

$("evaluateExpression").addEventListener("click", () => {
  try {
    const expression = $("expressionInput").value.replace(/\s/g, "");
    const postfix = infixToPostfix(expression);
    const answer = evaluatePostfix(postfix);

    showResult(
      "expressionResult",
      `Infix: ${expression}\nPostfix: ${postfix.join("")}\nEvaluated result: ${answer}`
    );
  } catch (error) {
    showResult("expressionResult", error.message, true);
  }
});

/* =========================================================
   11. TOWER OF HANOI — RECURSION
   ========================================================= */

let hanoiMoves = [];
let hanoiTimer = null;
let hanoiRunning = false;
let hanoiPosition = 0;
let hanoiState = [[], [], []];

function generateHanoi(n, from, auxiliary, to) {
  if (n === 0) return;

  generateHanoi(n - 1, from, to, auxiliary);
  hanoiMoves.push({ disk: n, from, to });
  generateHanoi(n - 1, auxiliary, from, to);
}

function initializeHanoi(n) {
  hanoiState = [[], [], []];

  for (let disk = n; disk >= 1; disk--) {
    hanoiState[0].push(disk);
  }

  hanoiPosition = 0;
}

function renderHanoi() {
  const area = $("hanoiVisual");
  area.innerHTML = "";

  const names = ["A", "B", "C"];

  hanoiState.forEach((disks, pegIndex) => {
    const peg = document.createElement("div");
    peg.className = "peg";

    disks.forEach(disk => {
      const shape = document.createElement("div");
      shape.className = "hanoi-disk";
      shape.style.width = `${28 + disk * 15}px`;
      shape.textContent = "";
      peg.appendChild(shape);
    });

    const base = document.createElement("div");
    base.className = "peg-base";
    peg.appendChild(base);

    const label = document.createElement("span");
    label.textContent = names[pegIndex];
    peg.appendChild(label);

    area.appendChild(peg);
  });
}

function stopHanoi() {
  if (hanoiTimer) clearInterval(hanoiTimer);
  hanoiTimer = null;
  hanoiRunning = false;
}

function startHanoi() {
  stopHanoi();

  const n = Number($("hanoiDisks").value);

  if (!Number.isInteger(n) || n < 1 || n > 6) {
    toast("Choose between 1 and 6 disks.");
    return;
  }

  hanoiMoves = [];
  generateHanoi(n, 0, 1, 2);
  initializeHanoi(n);
  renderHanoi();

  showResult("hanoiResult",
    `Total moves required: ${hanoiMoves.length} (2^${n} - 1)`
  );

  hanoiRunning = true;

  hanoiTimer = setInterval(() => {
    if (hanoiPosition >= hanoiMoves.length) {
      stopHanoi();
      toast("Tower of Hanoi completed.");
      return;
    }

    const move = hanoiMoves[hanoiPosition];
    const disk = hanoiState[move.from].pop();

    if (disk === undefined) {
      stopHanoi();
      showResult("hanoiResult", "Invalid disk movement.", true);
      return;
    }

    hanoiState[move.to].push(disk);
    hanoiPosition++;

    renderHanoi();

    showResult(
      "hanoiResult",
      `Move ${hanoiPosition} of ${hanoiMoves.length}: Move disk ${move.disk} from peg ${["A","B","C"][move.from]} to peg ${["A","B","C"][move.to]}.`
    );

    if (hanoiPosition >= hanoiMoves.length) {
      stopHanoi();
      toast("Tower of Hanoi completed.");
    }
  }, 650);
}

$("startHanoi").addEventListener("click", startHanoi);

$("resetHanoi").addEventListener("click", () => {
  stopHanoi();

  const n = Math.max(1, Math.min(6, Number($("hanoiDisks").value) || 3));

  initializeHanoi(n);
  hanoiMoves = [];
  renderHanoi();

  showResult("hanoiResult", "Tower of Hanoi reset.");
});

/* =========================================================
   DASHBOARD STATISTICS
   ========================================================= */

function updateDashboard() {
  $("statStudents").textContent = students.length;
  $("statMessages").textContent = messageQueue.length;
  $("statGroups").textContent = studyGroup.length;
  $("statNotifications").textContent = notifications.items.length;
}

/* =========================================================
   INITIAL SAMPLE DATA
   ========================================================= */

function initializeDemo() {
  const demoStudents = [
    ["101", "Sahana", "sahana@example.com", "IT"],
    ["102", "Shrivathsan A", "shrivathsan@example.com", "IT"],
    ["103", "Aakash V", "aakash@example.com", "IT"],
    ["104", "Priya", "priya@example.com", "IT"],
    ["105", "Arun", "arun@example.com", "IT"]
  ];

  demoStudents.forEach(data => students.insert(...data));

  refreshStudents();
  refreshStudentOptions();

  // Example student network connections
  graph.addEdge("101", "102");
  graph.addEdge("102", "103");
  graph.addEdge("103", "104");
  graph.addEdge("101", "105");

  renderGraph();
  renderMatrix();

  // Example circular study group
  ["Sahana", "Shrivathsan A", "Aakash V"].forEach(name => {
    studyGroup.append(name);
  });

  renderStudyGroup();

  // Example notifications
  notifications.insert({
    id: ++notificationId,
    text: "Data Structures project review",
    priority: 9
  });

  notifications.insert({
    id: ++notificationId,
    text: "Study group meeting reminder",
    priority: 6
  });

  notifications.insert({
    id: ++notificationId,
    text: "Student communication update",
    priority: 4
  });

  renderHeap();

  // Example BST values
  [50, 30, 70, 20, 40].forEach(value => bst.insert(value));
  renderBST();

  // Initial hash table
  [101, 202, 303].forEach(value => hashInsert(value));
  renderHashTable();

  // Initial Hanoi display
  initializeHanoi(3);
  renderHanoi();

  updateDashboard();
}

initializeDemo();

console.log("Student Communication System loaded successfully.");
