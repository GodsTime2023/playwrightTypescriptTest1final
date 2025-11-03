Feature: Login test

    As a user i want to be able to login using valid credentials

Scenario: Successful login with valid credentials
    Given I navigate to the login page
    When I enter valid username and password
    |username     |password     |
    |standard_user|secret_sauce |
    And I click on the login button
    Then I should be redirected to the product page
    | title    |
    | Products |

Scenario: Un-Successful login with valid credentials
    Given I navigate to the login page
    When I enter valid username and password
    |username     |password     |
    |standard_user|secret_sauc  |
    And I click on the login button
    Then I should be redirected to the product page
    | title    |
    | Products |