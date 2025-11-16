describe('Система Уведомлений - E2E Тесты', () => {
  
  const createNotification = (type: string, title: string, message: string) => {
    cy.get('[data-cy="type-select"]').select(type);
    cy.get('[data-cy="title-input"]').clear().type(title);
    cy.get('[data-cy="message-textarea"]').clear().type(message);
    cy.get('[data-cy="submit-button"]').click();
  };

  describe('Загрузка страницы', () => {
    it('должен успешно загружать главную страницу', () => {
      cy.visit('/');
      cy.get('h1').should('contain', 'Создание Уведомлений');
    });
  });

  describe('Alert уведомления', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('[data-cy="channel-select"]').select('alert');
    });

    it('должен показывать success alert уведомление', () => {
      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      createNotification('success', 'Успех!', 'Операция выполнена успешно');

      cy.then(() => {
        expect(alertStub).to.be.calledOnce;
      });
    });
  });

  describe('Модальные уведомления', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('[data-cy="channel-select"]').select('modal');
    });

    it('должен показывать success модальное окно', () => {
      createNotification('success', 'Успех!', 'Данные сохранены');

      cy.get('[data-cy="modal-content"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="modal-title"]').should('contain', 'Успех!');
        });
    });

    it('должен закрывать модальное окно по крестику', () => {
      createNotification('success', 'Тест закрытия', 'Закройте это окно');
      cy.get('[data-cy="modal-content"]').should('be.visible');
      cy.get('[data-cy="close-modal-button"]').click();
      cy.get('[data-cy="modal-content"]').should('not.exist');
    });
  });

  describe('Toast уведомления - базовые', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('должен показывать success toast уведомление', () => {
      createNotification('success', 'Успех!', 'Операция завершена');

      cy.get('[data-cy="toast-notification-item"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-cy="notification-title"]').should('contain', 'Успех!');
        });
    });

    it('должен закрывать toast уведомление по кнопке', () => {
      createNotification('success', 'Закрываемый toast', 'Нажмите X для закрытия');
      cy.get('[data-cy="toast-notification-item"]').should('be.visible');
      cy.get('[data-cy="close-toast-button"]').click();
      cy.get('[data-cy="toast-notification-item"]').should('not.exist');
    });
  });

  describe('Toast уведомления - группировка', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('[data-cy="grouped-checkbox"]').check();
    });

    it('должен группировать одинаковые уведомления с счетчиком', () => {
      createNotification('success', 'Новое сообщение', 'У вас новое уведомление');
      cy.wait(100);
      createNotification('success', 'Новое сообщение', 'У вас новое уведомление');
      cy.wait(100);
      createNotification('success', 'Новое сообщение', 'У вас новое уведомление');

      cy.get('[data-cy="toast-notification-item"]')
        .should('have.length', 1)
        .and('contain', 'Новое сообщение (3)');
    });
  });

  describe('Задержки перед показом', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('должен показывать toast уведомление с задержкой 2 секунды', () => {
      cy.get('[data-cy="delay-input"]').clear().type('2');

      createNotification('success', 'Уведомление с задержкой', 'Должно появиться через 2 секунды');

      cy.get('[data-cy="toast-notification-item"]')
        .should('not.exist');

      cy.wait(1000);
      cy.get('[data-cy="toast-notification-item"]')
        .should('not.exist');

      cy.wait(1500);
      cy.get('[data-cy="toast-notification-item"]')
        .should('be.visible')
        .and('contain', 'Уведомление с задержкой');
    });

    it('должен показывать модальное окно с задержкой 2 секунды', () => {
      cy.get('[data-cy="channel-select"]').select('modal');
      cy.get('[data-cy="delay-input"]').clear().type('2');

      createNotification('error', 'Модальное с задержкой', 'Тест');

      cy.get('[data-cy="modal-content"]')
        .should('not.exist');

      cy.wait(1000);
      cy.get('[data-cy="modal-content"]')
        .should('not.exist');

      cy.wait(1500);
      cy.get('[data-cy="modal-content"]')
        .should('be.visible')
        .and('contain', 'Модальное с задержкой');
    });

    it('должен показывать alert с задержкой 2 секунды', () => {
      cy.get('[data-cy="channel-select"]').select('alert');
      cy.get('[data-cy="delay-input"]').clear().type('2');
      
      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      createNotification('success', 'Alert с задержкой', 'Тест');

      cy.then(() => {
        expect(alertStub).to.not.be.called;
      });

      cy.wait(1000);
      cy.then(() => {
        expect(alertStub).to.not.be.called;
      });

      cy.wait(1500);
      cy.then(() => {
        expect(alertStub).to.be.calledOnce;
      });
    });
  });

  describe('Автоочистка уведомлений', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('должен автоматически удалять toast через 2 секунды', () => {
      cy.get('[data-cy="duration-input"]').clear().type('2');
      
      createNotification('success', 'Временное уведомление', 'Исчезнет через 2 секунды');

      cy.get('[data-cy="toast-notification-item"]')
        .should('be.visible')
        .and('contain', 'Временное уведомление');

      cy.wait(1000);
      cy.get('[data-cy="toast-notification-item"]')
        .should('be.visible');

      cy.wait(1500);
      cy.get('[data-cy="toast-notification-item"]')
        .should('not.exist');
    });

    it('должен показывать уведомление бесконечно при duration = 0', () => {
      cy.get('[data-cy="duration-input"]').clear().type('0');
      
      createNotification('error', 'Бесконечное уведомление', 'Не должно исчезнуть само');

      cy.get('[data-cy="toast-notification-item"]')
        .should('be.visible');

      cy.wait(5000);

      cy.get('[data-cy="toast-notification-item"]')
        .should('be.visible')
        .and('contain', 'Бесконечное уведомление');
    });

    it('должен отображать время жизни в уведомлении', () => {
      cy.get('[data-cy="duration-input"]').clear().type('5');
      
      createNotification('success', 'Уведомление с таймером', 'Проверка отображения времени');

      cy.get('[data-cy="toast-notification-item"]')
        .within(() => {
          cy.get('[data-cy="notification-duration"]')
            .should('be.visible')
            .and('contain', 'Исчезнет через: 5с');
        });
    });

    it('должен автоматически удалять группированные уведомления', () => {
      cy.get('[data-cy="grouped-checkbox"]').check();
      cy.get('[data-cy="duration-input"]').clear().type('2');
      
      createNotification('success', 'Групповое уведомление', 'Тест автоочистки');
      cy.wait(100);
      createNotification('success', 'Групповое уведомление', 'Тест автоочистки');

      cy.get('[data-cy="toast-notification-item"]')
        .should('be.visible')
        .and('contain', 'Групповое уведомление (2)');

      cy.wait(2500);
      cy.get('[data-cy="toast-notification-item"]')
        .should('not.exist');
    });
  });

  describe('Дополнительные сценарии', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('должен блокировать кнопку при невалидной форме', () => {
      cy.get('[data-cy="submit-button"]').should('be.disabled');
      cy.get('[data-cy="title-input"]').type('Только заголовок');
      cy.get('[data-cy="submit-button"]').should('be.disabled');
      cy.get('[data-cy="message-textarea"]').type('Теперь и сообщение');
      cy.get('[data-cy="submit-button"]').should('not.be.disabled');
    });

    it('должен очищать форму', () => {
      cy.get('[data-cy="type-select"]').select('warning');
      cy.get('[data-cy="title-input"]').type('Тестовый заголовок');
      cy.get('[data-cy="message-textarea"]').type('Тестовое сообщение');
      cy.get('[data-cy="duration-input"]').clear().type('10');
      cy.get('[data-cy="delay-input"]').clear().type('2');
      cy.get('[data-cy="grouped-checkbox"]').check();

      cy.get('[data-cy="clear-button"]').click();

      cy.get('[data-cy="title-input"]').should('have.value', '');
      cy.get('[data-cy="message-textarea"]').should('have.value', '');
      cy.get('[data-cy="duration-input"]').should('have.value', '5');
      cy.get('[data-cy="delay-input"]').should('have.value', '0');
      cy.get('[data-cy="grouped-checkbox"]').should('not.be.checked');
    });
  });
});