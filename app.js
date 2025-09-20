// Mobile-First FriendSync Calendar App
class MobileFriendSyncCalendar {
    constructor() {
        this.currentDate = new Date(2025, 8, 20); // September 20, 2025
        this.friends = [];
        this.events = [];
        this.ideas = [];
        this.selectedDate = null;
        this.editingEventId = null;
        this.editingIdeaId = null;
        this.currentFilter = 'all';
        
        // Touch/swipe handling
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isSwipeEnabled = true;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    initializeApp() {
        this.loadSampleData();
        this.renderCalendar();
        this.renderFriends();
        this.renderIdeas();
        this.bindEvents();
        this.initializeSwipeGestures();
        this.showTab('calendar');
    }
    
    loadSampleData() {
        // Load friends from provided data
        this.friends = [
            {id: 1, name: "Toby", color: "#3B82F6", visible: true},
            {id: 2, name: "Sam", color: "#EF4444", visible: true},
            {id: 3, name: "Jacob", color: "#10B981", visible: true},
            {id: 4, name: "Ben", color: "#F59E0B", visible: true}
        ];
        
        // Load sample events with recurring patterns
        this.events = [];
        this.generateRecurringEvents();
        
        // Load sample ideas
        this.ideas = [
            {
                id: 1,
                title: "Watch new movie at cinema",
                description: "There's this awesome new sci-fi movie that just came out, would love to go see it with everyone",
                suggestedBy: 2,
                timeframe: "next 2 weeks",
                category: "Movies",
                interested: [1, 3],
                status: "suggested",
                dateCreated: "2025-09-18"
            },
            {
                id: 2,
                title: "Try the new Italian restaurant",
                description: "Heard great things about this place downtown, perfect for a group dinner",
                suggestedBy: 3,
                timeframe: "this month",
                category: "Restaurants",
                interested: [1, 2],
                status: "suggested",
                dateCreated: "2025-09-17"
            }
        ];
    }
    
    generateRecurringEvents() {
        const recurringEvents = [
            {
                title: "College",
                friend: 1,
                time: "09:00",
                endTime: "17:00",
                description: "Daily college classes",
                type: "busy",
                pattern: "weekdays"
            },
            {
                title: "Work",
                friend: 2,
                time: "08:30",
                endTime: "17:30",
                description: "Full-time job",
                type: "busy",
                pattern: "weekdays"
            },
            {
                title: "Gym session",
                friend: 3,
                time: "06:00",
                endTime: "07:00",
                description: "Morning workout",
                type: "busy",
                pattern: "daily"
            }
        ];
        
        // Generate events for the current month and next month
        const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 2, 0);
        
        recurringEvents.forEach((template, index) => {
            const currentDate = new Date(startDate);
            let eventId = (index + 1) * 1000;
            
            while (currentDate <= endDate) {
                let shouldAddEvent = false;
                
                if (template.pattern === 'daily') {
                    shouldAddEvent = true;
                } else if (template.pattern === 'weekdays') {
                    const dayOfWeek = currentDate.getDay();
                    shouldAddEvent = dayOfWeek >= 1 && dayOfWeek <= 5;
                }
                
                if (shouldAddEvent) {
                    this.events.push({
                        id: eventId++,
                        title: template.title,
                        date: this.formatDate(currentDate),
                        friend: template.friend,
                        time: template.time,
                        endTime: template.endTime,
                        description: template.description,
                        type: template.type,
                        isRecurring: true
                    });
                }
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });
        
        // Add some individual events
        this.events.push(
            {
                id: 5001,
                title: "Available for hangout",
                date: "2025-09-22",
                friend: 1,
                time: "19:00",
                description: "Free after college",
                type: "available"
            },
            {
                id: 5002,
                title: "Movie night",
                date: "2025-09-24",
                friend: 4,
                time: "20:00",
                description: "Watching the new action movie",
                type: "hangout"
            }
        );
    }
    
    bindEvents() {
        // Hamburger menu
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const closeSidebar = document.getElementById('closeSidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        hamburgerBtn?.addEventListener('click', () => this.toggleSidebar());
        closeSidebar?.addEventListener('click', () => this.closeSidebar());
        sidebarOverlay?.addEventListener('click', () => this.closeSidebar());
        
        // Calendar navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonth')?.addEventListener('click', () => this.nextMonth());
        
        // Bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = item.dataset.tab;
                this.showTab(tab);
                this.updateNavigation(tab);
            });
        });
        
        // FAB and quick add
        document.getElementById('fab')?.addEventListener('click', () => this.openQuickAdd());
        document.getElementById('quickAddBtn')?.addEventListener('click', () => this.openQuickAdd());
        
        // Friend management
        document.getElementById('addFriendBtn')?.addEventListener('click', () => this.openAddFriendModal());
        this.bindModalEvents('addFriendModal', 'friendModalOverlay', 'closeFriendModal', 'cancelFriend');
        document.getElementById('addFriendForm')?.addEventListener('submit', (e) => this.handleAddFriend(e));
        
        // Event management
        this.bindModalEvents('addEventModal', 'eventModalOverlay', 'closeEventModal', 'cancelEvent');
        document.getElementById('addEventForm')?.addEventListener('submit', (e) => this.handleAddEvent(e));
        document.getElementById('deleteEvent')?.addEventListener('click', () => this.handleDeleteEvent());
        
        // Idea management
        document.getElementById('addIdeaBtn')?.addEventListener('click', () => this.openAddIdeaModal());
        this.bindModalEvents('addIdeaModal', 'ideaModalOverlay', 'closeIdeaModal', 'cancelIdea');
        document.getElementById('addIdeaForm')?.addEventListener('submit', (e) => this.handleAddIdea(e));
        
        // Day events modal
        this.bindModalEvents('dayEventsModal', 'dayEventsOverlay', 'closeDayEvents');
        document.getElementById('addEventForDay')?.addEventListener('click', () => {
            this.closeDayEventsModal();
            this.openAddEventModal(this.selectedDate);
        });
        
        // Color picker presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            const color = preset.dataset.color;
            preset.style.backgroundColor = color;
            preset.addEventListener('click', () => this.selectColorPreset(color));
        });
        
        // Ideas filters
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const filter = chip.dataset.filter;
                this.setIdeasFilter(filter);
            });
        });
        
        // Initialize color preset
        this.updateColorPresetSelection('#3B82F6');
        
        // Add haptic feedback to all buttons
        this.addHapticFeedback();
    }
    
    bindModalEvents(modalId, overlayId, closeId, cancelId = null) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById(overlayId);
        const closeBtn = document.getElementById(closeId);
        const cancelBtn = cancelId ? document.getElementById(cancelId) : null;
        
        const closeModal = () => {
            modal?.classList.add('hidden');
            this.clearModalForm(modalId);
        };
        
        overlay?.addEventListener('click', closeModal);
        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);
    }
    
    initializeSwipeGestures() {
        const calendarContainer = document.querySelector('.calendar-container');
        
        calendarContainer?.addEventListener('touchstart', (e) => {
            if (!this.isSwipeEnabled) return;
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        calendarContainer?.addEventListener('touchend', (e) => {
            if (!this.isSwipeEnabled) return;
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }
    
    handleSwipe() {
        const swipeThreshold = 100;
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                this.previousMonth();
            } else {
                this.nextMonth();
            }
        }
    }
    
    addHapticFeedback() {
        // Add visual feedback for touch interactions
        document.querySelectorAll('button, .calendar-day, .friend-item, .idea-card').forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.98)';
                element.style.opacity = '0.8';
            }, { passive: true });
            
            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.style.transform = '';
                    element.style.opacity = '';
                }, 100);
            }, { passive: true });
        });
    }
    
    // Navigation methods
    showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${tabName}Tab`);
        targetTab?.classList.add('active');
        
        this.updateNavigation(tabName);
    }
    
    updateNavigation(activeTab) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === activeTab);
        });
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const hamburger = document.getElementById('hamburgerBtn');
        
        const isOpen = sidebar?.classList.contains('open');
        
        if (isOpen) {
            this.closeSidebar();
        } else {
            sidebar?.classList.add('open');
            overlay?.classList.remove('hidden');
            overlay?.classList.add('visible');
            hamburger?.classList.add('active');
        }
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const hamburger = document.getElementById('hamburgerBtn');
        
        sidebar?.classList.remove('open');
        overlay?.classList.add('hidden');
        overlay?.classList.remove('visible');
        hamburger?.classList.remove('active');
    }
    
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }
    
    // Calendar rendering
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update header
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const monthHeader = document.getElementById('currentMonth');
        if (monthHeader) {
            monthHeader.textContent = `${monthNames[month]} ${year}`;
        }
        
        // Generate calendar days
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendarBody = document.getElementById('calendarBody');
        if (!calendarBody) return;
        
        calendarBody.innerHTML = '';
        
        const today = new Date(2025, 8, 20); // September 20, 2025
        
        for (let i = 0; i < 42; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.dataset.date = this.formatDate(currentDay);
            
            // Add classes for styling
            if (currentDay.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (currentDay.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            // Check for events on this day
            const dayEvents = this.getEventsForDate(this.formatDate(currentDay));
            const visibleEvents = dayEvents.filter(event => {
                const friend = this.friends.find(f => f.id === event.friend);
                return friend && friend.visible;
            });
            
            if (visibleEvents.length > 0) {
                dayElement.classList.add('has-events');
            }
            
            dayElement.innerHTML = `
                <div class="day-number">${currentDay.getDate()}</div>
                <div class="day-events"></div>
            `;
            
            // Render events for mobile
            this.renderMobileDayEvents(dayElement, visibleEvents);
            
            // Add click handler
            dayElement.addEventListener('click', (e) => {
                e.preventDefault();
                if (visibleEvents.length > 0) {
                    this.openDayEventsModal(currentDay, visibleEvents);
                } else {
                    this.openAddEventModal(currentDay);
                }
            });
            
            // Add long press for quick event creation
            let pressTimer;
            dayElement.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    this.openAddEventModal(currentDay);
                    // Prevent the click event
                    e.preventDefault();
                }, 800);
            });
            
            dayElement.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            });
            
            calendarBody.appendChild(dayElement);
        }
    }
    
    renderMobileDayEvents(dayElement, events) {
        const eventsContainer = dayElement.querySelector('.day-events');
        eventsContainer.innerHTML = '';
        
        if (events.length === 0) return;
        
        if (events.length <= 3) {
            // Show event dots for small numbers
            events.forEach(event => {
                const friend = this.friends.find(f => f.id === event.friend);
                if (friend) {
                    const dot = document.createElement('div');
                    dot.className = 'event-dot';
                    dot.style.backgroundColor = friend.color;
                    eventsContainer.appendChild(dot);
                }
            });
        } else {
            // Show event count badge for larger numbers
            const badge = document.createElement('div');
            badge.className = 'event-badge';
            badge.textContent = events.length;
            eventsContainer.appendChild(badge);
        }
    }
    
    renderFriends() {
        const friendsList = document.getElementById('friendsList');
        if (!friendsList) return;
        
        friendsList.innerHTML = '';
        
        this.friends.forEach(friend => {
            const friendElement = document.createElement('div');
            friendElement.className = `friend-item ${friend.visible ? '' : 'hidden'}`;
            friendElement.innerHTML = `
                <div class="friend-info">
                    <div class="friend-color" style="background-color: ${friend.color}"></div>
                    <span class="friend-name">${friend.name}</span>
                </div>
                <button class="friend-toggle">${friend.visible ? '👁️' : '👁️‍🗨️'}</button>
            `;
            
            const toggleBtn = friendElement.querySelector('.friend-toggle');
            toggleBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFriendVisibility(friend.id);
            });
            
            friendsList.appendChild(friendElement);
        });
        
        this.updateEventFriendSelector();
    }
    
    renderIdeas() {
        const ideasList = document.getElementById('ideasList');
        if (!ideasList) return;
        
        ideasList.innerHTML = '';
        
        const filteredIdeas = this.currentFilter === 'all' 
            ? this.ideas 
            : this.ideas.filter(idea => idea.category === this.currentFilter);
        
        if (filteredIdeas.length === 0) {
            ideasList.innerHTML = `
                <div class="idea-card">
                    <p style="color: var(--color-text-secondary); text-align: center; margin: 0;">
                        No ideas in this category yet. Be the first to add one!
                    </p>
                </div>
            `;
            return;
        }
        
        filteredIdeas.forEach(idea => {
            const suggestedBy = this.friends.find(f => f.id === idea.suggestedBy);
            const interestedCount = idea.interested ? idea.interested.length : 0;
            
            const ideaElement = document.createElement('div');
            ideaElement.className = 'idea-card';
            ideaElement.innerHTML = `
                <div class="idea-header">
                    <h3 class="idea-title">${idea.title}</h3>
                </div>
                <div class="idea-meta">
                    <span class="idea-category">${idea.category}</span>
                    <span class="idea-timeframe">${idea.timeframe}</span>
                </div>
                <p class="idea-description">${idea.description}</p>
                <div class="idea-actions">
                    <div class="vote-buttons">
                        <button class="vote-btn upvote" data-idea="${idea.id}" data-vote="up">👍</button>
                        <button class="vote-btn downvote" data-idea="${idea.id}" data-vote="down">👎</button>
                    </div>
                    <span class="interested-count">${interestedCount} interested</span>
                </div>
                <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: var(--space-8) 0 0 0;">
                    Suggested by ${suggestedBy ? suggestedBy.name : 'Unknown'}
                </p>
            `;
            
            // Add vote handlers
            const voteButtons = ideaElement.querySelectorAll('.vote-btn');
            voteButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const ideaId = parseInt(btn.dataset.idea);
                    const voteType = btn.dataset.vote;
                    this.handleIdeaVote(ideaId, voteType);
                });
            });
            
            ideasList.appendChild(ideaElement);
        });
    }
    
    // Modal management
    openQuickAdd() {
        // For mobile, open event creation for today
        this.openAddEventModal(new Date(2025, 8, 20));
    }
    
    openAddFriendModal() {
        const modal = document.getElementById('addFriendModal');
        modal?.classList.remove('hidden');
        
        // Focus on name input after animation
        setTimeout(() => {
            document.getElementById('friendName')?.focus();
        }, 300);
    }
    
    openAddEventModal(date) {
        this.selectedDate = date;
        this.editingEventId = null;
        
        const modal = document.getElementById('addEventModal');
        const title = document.getElementById('eventModalTitle');
        const form = document.getElementById('addEventForm');
        const deleteBtn = document.getElementById('deleteEvent');
        const saveBtn = document.getElementById('saveEvent');
        
        title.textContent = 'Add Event';
        form?.reset();
        deleteBtn.style.display = 'none';
        saveBtn.textContent = 'Save Event';
        
        modal?.classList.remove('hidden');
        
        setTimeout(() => {
            document.getElementById('eventTitle')?.focus();
        }, 300);
    }
    
    openEditEventModal(event) {
        this.editingEventId = event.id;
        
        const modal = document.getElementById('addEventModal');
        const title = document.getElementById('eventModalTitle');
        const titleInput = document.getElementById('eventTitle');
        const friendSelect = document.getElementById('eventFriend');
        const typeSelect = document.getElementById('eventType');
        const timeInput = document.getElementById('eventTime');
        const endTimeInput = document.getElementById('eventEndTime');
        const descInput = document.getElementById('eventDescription');
        const deleteBtn = document.getElementById('deleteEvent');
        const saveBtn = document.getElementById('saveEvent');
        
        title.textContent = 'Edit Event';
        titleInput.value = event.title;
        friendSelect.value = event.friend;
        typeSelect.value = event.type;
        timeInput.value = event.time || '';
        endTimeInput.value = event.endTime || '';
        descInput.value = event.description || '';
        deleteBtn.style.display = 'block';
        saveBtn.textContent = 'Update Event';
        
        modal?.classList.remove('hidden');
    }
    
    openDayEventsModal(date, events) {
        this.selectedDate = date;
        
        const modal = document.getElementById('dayEventsModal');
        const title = document.getElementById('dayEventsTitle');
        const eventsList = document.getElementById('dayEventsList');
        
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
        
        title.textContent = `Events for ${dateStr}`;
        
        eventsList.innerHTML = '';
        events.forEach(event => {
            const friend = this.friends.find(f => f.id === event.friend);
            if (!friend) return;
            
            const eventElement = document.createElement('div');
            eventElement.className = 'day-event-item';
            eventElement.innerHTML = `
                <div class="event-color-indicator" style="background-color: ${friend.color}"></div>
                <div class="event-details">
                    <h4>${event.title}</h4>
                    <p>${friend.name}${event.time ? ` • ${event.time}` : ''}${event.endTime ? ` - ${event.endTime}` : ''}</p>
                </div>
            `;
            
            eventElement.addEventListener('click', () => {
                this.closeDayEventsModal();
                this.openEditEventModal(event);
            });
            
            eventsList.appendChild(eventElement);
        });
        
        modal?.classList.remove('hidden');
    }
    
    closeDayEventsModal() {
        const modal = document.getElementById('dayEventsModal');
        modal?.classList.add('hidden');
    }
    
    openAddIdeaModal() {
        const modal = document.getElementById('addIdeaModal');
        const form = document.getElementById('addIdeaForm');
        
        form?.reset();
        modal?.classList.remove('hidden');
        
        setTimeout(() => {
            document.getElementById('ideaTitle')?.focus();
        }, 300);
    }
    
    clearModalForm(modalId) {
        const form = document.querySelector(`#${modalId} form`);
        form?.reset();
        
        if (modalId === 'addFriendModal') {
            document.getElementById('friendColor').value = '#3B82F6';
            this.updateColorPresetSelection('#3B82F6');
        }
        
        this.selectedDate = null;
        this.editingEventId = null;
        this.editingIdeaId = null;
    }
    
    // Event handlers
    handleAddFriend(e) {
        e.preventDefault();
        
        const name = document.getElementById('friendName')?.value.trim();
        const color = document.getElementById('friendColor')?.value;
        
        if (name && color) {
            const newFriend = {
                id: Date.now(),
                name: name,
                color: color,
                visible: true
            };
            
            this.friends.push(newFriend);
            this.renderFriends();
            this.renderCalendar(); // Re-render calendar to update events
            
            const modal = document.getElementById('addFriendModal');
            modal?.classList.add('hidden');
            this.clearModalForm('addFriendModal');
        }
    }
    
    handleAddEvent(e) {
        e.preventDefault();
        
        const title = document.getElementById('eventTitle')?.value.trim();
        const friendId = parseInt(document.getElementById('eventFriend')?.value);
        const type = document.getElementById('eventType')?.value;
        const time = document.getElementById('eventTime')?.value;
        const endTime = document.getElementById('eventEndTime')?.value;
        const description = document.getElementById('eventDescription')?.value.trim();
        
        if (title && friendId) {
            if (this.editingEventId) {
                // Update existing event
                const eventIndex = this.events.findIndex(e => e.id === this.editingEventId);
                if (eventIndex !== -1) {
                    this.events[eventIndex] = {
                        ...this.events[eventIndex],
                        title,
                        friend: friendId,
                        type,
                        time,
                        endTime,
                        description
                    };
                }
            } else {
                // Create new event
                const newEvent = {
                    id: Date.now(),
                    title,
                    date: this.formatDate(this.selectedDate),
                    friend: friendId,
                    type,
                    time,
                    endTime,
                    description,
                    isRecurring: false
                };
                
                this.events.push(newEvent);
            }
            
            this.renderCalendar();
            
            const modal = document.getElementById('addEventModal');
            modal?.classList.add('hidden');
            this.clearModalForm('addEventModal');
        }
    }
    
    handleDeleteEvent() {
        if (this.editingEventId) {
            this.events = this.events.filter(e => e.id !== this.editingEventId);
            this.renderCalendar();
            
            const modal = document.getElementById('addEventModal');
            modal?.classList.add('hidden');
            this.clearModalForm('addEventModal');
        }
    }
    
    handleAddIdea(e) {
        e.preventDefault();
        
        const title = document.getElementById('ideaTitle')?.value.trim();
        const category = document.getElementById('ideaCategory')?.value;
        const timeframe = document.getElementById('ideaTimeframe')?.value;
        const description = document.getElementById('ideaDescription')?.value.trim();
        
        if (title && category && timeframe) {
            const newIdea = {
                id: Date.now(),
                title,
                description,
                suggestedBy: 1, // Current user (assuming first friend)
                timeframe,
                category,
                interested: [],
                status: "suggested",
                dateCreated: new Date().toISOString().split('T')[0]
            };
            
            this.ideas.push(newIdea);
            this.renderIdeas();
            
            const modal = document.getElementById('addIdeaModal');
            modal?.classList.add('hidden');
            this.clearModalForm('addIdeaModal');
        }
    }
    
    handleIdeaVote(ideaId, voteType) {
        const idea = this.ideas.find(i => i.id === ideaId);
        if (!idea) return;
        
        const currentUserId = 1; // Assuming first friend is current user
        
        if (!idea.interested) {
            idea.interested = [];
        }
        
        const isInterested = idea.interested.includes(currentUserId);
        
        if (voteType === 'up' && !isInterested) {
            idea.interested.push(currentUserId);
        } else if (voteType === 'down' && isInterested) {
            idea.interested = idea.interested.filter(id => id !== currentUserId);
        }
        
        this.renderIdeas();
    }
    
    setIdeasFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.filter === filter);
        });
        
        this.renderIdeas();
    }
    
    toggleFriendVisibility(friendId) {
        const friend = this.friends.find(f => f.id === friendId);
        if (friend) {
            friend.visible = !friend.visible;
            this.renderFriends();
            this.renderCalendar();
        }
    }
    
    selectColorPreset(color) {
        const colorInput = document.getElementById('friendColor');
        if (colorInput) {
            colorInput.value = color;
        }
        this.updateColorPresetSelection(color);
    }
    
    updateColorPresetSelection(selectedColor) {
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.classList.toggle('selected', preset.dataset.color === selectedColor);
        });
    }
    
    updateEventFriendSelector() {
        const select = document.getElementById('eventFriend');
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select a friend</option>';
        
        this.friends.forEach(friend => {
            const option = document.createElement('option');
            option.value = friend.id;
            option.textContent = friend.name;
            select.appendChild(option);
        });
        
        if (currentValue) {
            select.value = currentValue;
        }
    }
    
    // Utility methods
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    getEventsForDate(dateString) {
        return this.events.filter(event => event.date === dateString);
    }
}

// Initialize the mobile app
new MobileFriendSyncCalendar();