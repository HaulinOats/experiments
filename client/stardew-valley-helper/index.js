"use strict";

fetch('./items.json').then(response => response.json()).then(data => {
  let itemSelect = document.getElementsByClassName('item-select')[0];
  let itemInfoDiv = document.getElementsByClassName('selected-item-info')[0];
  let itemData = data.items;

  //add event listener to item select
  itemSelect.addEventListener('change', actionHandler);

  //sort items alphabetically
  itemData.sort(sortAlphabetically);
  
  //build item select dropdown from returned items json
  let itemsOptionsHTML = "<option value='default'>- Select An Item -</option>";
  itemData.forEach(item => {
    itemsOptionsHTML += `<option value="${item.name}">${item.name}</option>`;
  });
  itemSelect.innerHTML = itemsOptionsHTML;

  function actionHandler(e){
    let classNames = e.target.classList;

    classNames.forEach(className=>{
      switch(className){
        case 'item-select':
          //remove default option
          if(e.target.options[0].value === 'default'){
            e.target.options[0].remove();
          }

          //get specfic item's data and push to HTML
          let selectedItemData;
          itemData.forEach(item => {
            if(item.name === e.target.value){
              return populateInfoDiv(item);
            }
          })
          break;
        default:
      }
    });


  }
  
  function populateInfoDiv(itemData){
    console.log(itemData);
    let infoDivHTML = "";
    switch(itemData.category){
      case "crop":
        infoDivHTML += `
          <h2>${itemData.name}</h2>
          <table class="item-info-table">
            <tbody>
              <tr>
                <th class="seeds">Seeds</th>
                <th class="sells-for">Sells For</th>
                <th class="restores">Restores</th>
                <th class="used-in">Used In</th>
              </tr>
              <tr>
                <td row-span="2">
                  <div class="img-container">
                    <a href="${itemData.seed.url}" target="_blank">
                      <img class="seed-img" src="./img/icons/crops/${itemData.seed.icon}"/>
                      <p class="seed-name">${itemData.seed.name}</p>
                    </a>
                  <div>
                  <div class="vendors">
                    ${itemData.vendors.forEach(vendor=>{
                      return `
                        <span>
                          <img class="vendor-icon" src="./img/icons/general/Pierre_Icon.webp">
                          <span class="vendor-name">${vendor.name}: ${vendor.cost}g</span>
                        </span>`
                    })}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        `;
        itemInfoDiv.innerHTML = infoDivHTML;
        break;
      default:
    }
  }
}).catch(err => {
  console.log('error getting item data');
  console.log(err);
});

function sortAlphabetically(a, b){
  if(a.name > b.name) return 1;
  if(a.name < b.name) return -1;
  return 0;
}