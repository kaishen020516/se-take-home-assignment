let normalOrderId = 1; 
let vipOrderId = 1;     
const pendingOrders = [];
const completeOrders = [];
const bots = [];

// Add new order function
function addOrder(type) {
    let order;
    if (type === "VIP") {
        order = { id: `VIP-${vipOrderId++}`, type, status: "PENDING" };
    } else {
        order = { id: `Normal-${normalOrderId++}`, type, status: "PENDING" };
    }
    // Add the order to the pendingOrders array
    if (type === "VIP") {
        const index = pendingOrders.findIndex(order => order.type === "Normal");
        pendingOrders.splice(index === -1 ? pendingOrders.length : index, 0, order);
    } else {
        pendingOrders.push(order);
    }
    renderOrders();
    processOrders(); 
}

// Function to add a bot manually
function addBot() {
    const bot = { id: bots.length + 1, status: "Idle", order: null };
    bots.push(bot);
    renderBots();

    // If there are no pending orders, let the user know but keep the bot in idle state
    if (pendingOrders.length === 0) {
        console.log("No pending orders to process. Bot added in Idle state.");
    } else {
        processOrders();  
    }
}

// Function to remove a bot
function removeBot() {
    const bot = bots.pop();
    if (bot && bot.order) {
        bot.order.status = "PENDING";

        // Reinsert the order into the pending orders array, giving priority to VIP orders and FIFO for Normal orders
        if (bot.order.type === "VIP") {
            pendingOrders.unshift(bot.order); // Add VIP orders to the front of the queue
        } else {
            // For normal orders, we need to reinsert it while maintaining FIFO order
            const normalOrderIndex = pendingOrders.findIndex(order => order.type === "Normal" && order.status === "PENDING");
            if (normalOrderIndex !== -1) {
                // Insert the destroyed normal order in its correct position to keep FIFO
                pendingOrders.splice(normalOrderIndex, 0, bot.order);
            } else {
                // If no normal orders are pending, just add it to the end
                pendingOrders.push(bot.order);
            }
        }

        bot.status = "Idle";  // Ensure bot is marked idle if removed during processing
        bot.order = null;
    }

    renderOrders();
    renderBots();

    // If there are no bots left, stop processing orders
    if (bots.length === 0) {
        console.log("No bots available. Orders will stay pending.");
    }

    processOrders(); // Continue processing orders
}


// Function to process orders
function processOrders() {
    // If no bots are available, do nothing
    if (bots.length === 0) {
        console.log("No bots available to process orders.");
        return;
    }

    bots.forEach(bot => {
        // Check if the bot is idle and there are pending orders to process
        if (bot.status === "Idle" && pendingOrders.length > 0) {
            const order = pendingOrders.shift(); // Get the first order in the queue
            bot.status = "Processing"; // Immediately set the bot's status to Processing
            bot.order = order; // Assign the order to the bot
            renderBots(); // Immediately render the bot status

            // Remove the order from Pending, and show it in the Bot area
            renderOrders();

            setTimeout(() => {
                // After 10 seconds, mark the order as COMPLETE
                if (bot.status === "Processing") {
                    order.status = "COMPLETE";
                    completeOrders.push(order);
                }

                bot.status = "Idle"; // Reset bot status to Idle after completion or interruption
                bot.order = null; // Clear the order from the bot
                renderOrders();
                renderBots();
                processOrders(); // Continue processing remaining orders if any
            }, 10000); // 10 seconds
        }
    });
}

// Render functions
function renderOrders() {
    const pendingDiv = document.getElementById("pending");
    const botDiv = document.getElementById("bot");
    const completeDiv = document.getElementById("complete");

    // Ensure that the headers stay intact
    pendingDiv.innerHTML = "<h2>Pending</h2>";
    botDiv.innerHTML = "<h2>Processing</h2>";
    completeDiv.innerHTML = "<h2>Completed</h2>";

    // Render pending orders that are not being processed
    pendingOrders.forEach(order => {
        if (order.status !== "Processing") {  // Only render orders that are not being processed
            const div = document.createElement("div");
            div.className = `order ${order.type.toLowerCase()}`;
            div.textContent = `Order ${order.id} (${order.type})`;
            pendingDiv.appendChild(div);
        }
    });

    // Render bot orders that are being processed
    bots.forEach(bot => {
        if (bot.order && bot.status === "Processing") {
            const div = document.createElement("div");
            div.className = `order ${bot.order.type.toLowerCase()}`;
            div.textContent = `Bot ${bot.id}: Processing Order ${bot.order.id} (${bot.order.type})`;
            botDiv.appendChild(div);
        }
    });

    // Render complete orders
    completeOrders.forEach(order => {
        const div = document.createElement("div");
        div.className = `order ${order.type.toLowerCase()}`;
        div.textContent = `Order ${order.id} (${order.type})`;
        completeDiv.appendChild(div);
    });
}

function renderBots() {
    const botsDiv = document.getElementById("bots");
    botsDiv.innerHTML = "<h2>Bots</h2>";
    bots.forEach(bot => {
        const div = document.createElement("div");
        if (bot.order) {
            // If the bot is processing an order, display that order ID
            div.textContent = `Bot ${bot.id}: Processing Order ${bot.order.id}`;
        } else {
            // If the bot is idle, display "Idle"
            div.textContent = `Bot ${bot.id}: Idle`;
        }
        botsDiv.appendChild(div);
    });
}
