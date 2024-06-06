/**
 * Only submit anything if document is ready to avoid unforeseen problems
 */

$(document).ready(function () {
    $('#scrapingForm').on('submit', function (event) {
        event.preventDefault();

        // show loading animation
        $('.isLoading').css('display', 'flex');

        const keyword = $('#keyword').val();
        const url = 'http://localhost:3000/api/scrape';

        $.get(url, { keyword: keyword })
            .done(response => {
                $('.keyword').text(keyword);
                displayItems(1, response);
                $('.modal').show();
                $('.isLoading').hide();
            })
            .fail((xhr, status, error) => {
                console.error(error);
            });
    });
});

/**
 * Function to build a new div with current element's information such as 
 * title, stars, reviews and image.
 * 
 * @param element current element in items map iteration
 * @returns Returns a new div element with correctly applied info from current element
 */
function generateItem(element) {
    return $('<div>', { class: 'item bg-white p-4 rounded-md shadow-md' })
        .append($('<h2>', { class: 'text-xs font-semibold mb-2', text: element.title }))
        .append($('<p>', { class: 'text-gray-600 text-xs mb-2', text: 'Stars: ' + element.stars }))
        .append($('<p>', { class: 'text-gray-600 text-xs mb-2', text: 'Reviews: ' + element.reviews }))
        .append($('<img>', { src: element.imageUrl, class: 'w-20 h-20 object-contain mx-auto' }));
}

/**
 * Display items for current page, while updating pagination links
 * @param page Current page, default 1 from ajax call 
 * @param response Response from ajax request, contains an array with all fetched elements from amazon search by keyword 
 */
function displayItems(page, response) {
    const itemsPerPage = 12;

    // if page is 2 and items per page is 12, means 12 items have been shown in page 1(item 1 to 12), therefore start at item 12 and finish at
    // 12 + 12 = finish at item 24
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // slice the response array between starting item position and last item position to show only our desired items
    const itemsToShow = response.slice(startIndex, endIndex);

    // empty item container if there is anything there then append items to it in a map iteration which will build our item divs according to
    // current iterated element
    $('.items-container').empty().append(itemsToShow.map(generateItem));

    // finally update the pagination with current page and total pages, also pass response for calling displayItems again incase a page link is clicked
    // (if there is 60 items in our response and there's 12 items per page, the total pages should be 5)
    updatePagination(page, Math.ceil(response.length / itemsPerPage), response);
}

/**
 * Update current pagination with new items by calling displayItems and updating the pagination links div
 * @param currentPage current page we're in
 * @param totalPages
 * @param response original response data array
 */
function updatePagination(currentPage, totalPages, response) {
    $('.pagination').empty();

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = $('<a>', {
            class: `text-blue-500 hover:underline cursor-pointer px-2 ${i === currentPage ? 'font-black' : ''}`,
            text: i,
            click: () => displayItems(i, response)
        });
        $('.pagination').append(pageLink);
    }
}