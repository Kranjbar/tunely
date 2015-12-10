/* CLIENT-SIDE JS
 *
 * You may edit this file as you see fit.  Try to separate different components
 * into functions and objects as needed.
 *
 */



$(document).ready(function() {
  console.log('app.js loaded!');
  $.get('/api/albums').success(function (albums) {
    albums.forEach(function(album) {
      renderAlbum(album);
    });
  });


  $('#album-form form').on('submit', function(e) {
    e.preventDefault();
    var formData = $(this).serialize();
    console.log('formData', formData);
    $.post('/api/albums', formData, function(album) {
      console.log('album after POST', album);
      renderAlbum(album);  //render the server's response
    });
    $(this).trigger("reset");
  });


  $('#albums').on('click', '.add-song', function(e) {
    var id= $(this).parents('.album').data('album-id');
    console.log('id',id);
    $('#songModal').data('album-id', id);
    $('#songModal').modal();
  });

  $('#saveSong').on('click', handleNewSongSubmit);

  $('#albums').on('click', '.delete-album', function(e) {
    var id= $(this).parents('.album').data('album-id');
    console.log('id', id);
    $.ajax({
      method: 'DELETE',
      url: '/api/albums/' + id,
      success: function(album) {
        $('[data-album-id='+ id + ']').remove();
      }
    });
  });

  // $('.save-changes').hide();

  $('#albums').on('click', '.edit-album', function(e) {
    var id = $(this).parents('.album').data('album-id');
    console.log('id', id);
    $('[data-album-id=' + id + ']').find('.save-changes').toggle();
    $('[data-album-id=' + id + ']').find('.edit-album').toggle();
    var albumName = $('[data-album-id=' + id + ']').find('span.album-name').text();
    var artistName = $('[data-album-id=' + id + ']').find('span.artist-name').text();
    var releaseDate = $('[data-album-id=' + id + ']').find('span.album-releaseDate').text();
    $('[data-album-id=' + id + ']').find('span.album-name').html('<input class="edit-album-name" value="' + albumName + '"></input>');
    $('[data-album-id=' + id + ']').find('span.artist-name').html('<input class="edit-artist-name" value="' + artistName + '"></input>');
    $('[data-album-id=' + id + ']').find('span.album-releaseDate').html('<input class="edit-album-releaseDate" value="' + releaseDate + '"></input>');
  });

  $('#albums').on('click', '.save-changes', function(e) {
    var albumId = $(this).parents('.album').data('album-id');
    var albumName = $('.edit-album-name').val();
    var artistName = $('.edit-artist-name').val();
    var releaseDate = $('.edit-album-releaseDate').val();
    var formData = {
      artistName: artistName,
      name: albumName,
      releaseDate: releaseDate
    };

    var putUrl = '/api/albums/' + albumId;

    $.ajax({
      method: 'PUT',
      url: putUrl,
      data: formData,
      success: function(album) {
        console.log(album);
        $.get('/api/albums/' + albumId).success(function(album) {
          $('[data-album-id='+ albumId + ']').remove();
          renderAlbum(album);
        });
      },
      error: function(error) {
        console.log('Failure!');
      }
    });
  });

    // Open the modal
    $('#albums').on('click', '.add-song', function(e) {
    var id= $(this).parents('.album').data('album-id');
    console.log('id',id);
    $('#editSongModal').data('album-id', id);
    $('#editSongModal').modal();
});


// handles the modal fields and POSTing the form to the server
// doug is cool
function handleNewSongSubmit(e) {
  var albumId = $('#songModal').data('album-id');
  var songName = $('#songName').val();
  var trackNumber = $('#trackNumber').val();

  var formData = {
    name: songName,
    trackNumber: trackNumber
  };

  var postUrl = '/api/albums/' + albumId + '/songs';
  console.log('posting to ', postUrl, ' with data ', formData);

  $.post(postUrl, formData)
    .success(function(song) {
      console.log('song', song);

      // re-get full album and render on page
      $.get('/api/albums/' + albumId).success(function(album) {
        //remove old entry
        $('[data-album-id='+ albumId + ']').remove();
        // render a replacement
        renderAlbum(album);
      });

      //clear form
      $('#songName').val('');
      $('#trackNumber').val('');
      $('#songModal').modal('hide');

    });
}



function buildSongsHtml(songs) {
  var songText = "    &ndash; ";
  songs.forEach(function(song) {
    songText = songText + "(" + song.trackNumber + ") " + song.name + " &ndash; ";
  });
  var songsHtml  =
   "                      <li class='list-group-item'>" +
   "                        <h4 class='inline-header'>Songs:</h4>" +
   "                         <span>" + songText + "</span>" +
   "                      </li>";
  return songsHtml;
}



// this function takes a single album and renders it to the page
function renderAlbum(album) {
  console.log('rendering album:', album);

  var albumHtml =
  "        <!-- one album -->" +
  "        <div class='row album' data-album-id='" + album._id + "'>" +
  "          <div class='col-md-10 col-md-offset-1'>" +
  "            <div class='panel panel-default'>" +
  "              <div class='panel-body'>" +
  "              <!-- begin album internal row -->" +
  "                <div class='row'>" +
  "                  <div class='col-md-3 col-xs-12 thumbnail album-art'>" +
  "                     <img src='" + "http://placehold.it/400x400'" +  " alt='album image'>" +
  "                  </div>" +
  "                  <div class='col-md-9 col-xs-12'>" +
  "                    <ul class='list-group'>" +
  "                      <li class='list-group-item'>" +
  "                        <h4 class='inline-header'>Album Name:</h4>" +
  "                        <span class='album-name'>" + album.name + "</span>" +
  "                      </li>" +
  "                      <li class='list-group-item'>" +
  "                        <h4 class='inline-header'>Artist Name:</h4>" +
  "                        <span class='artist-name'>" + album.artistName + "</span>" +
  "                      </li>" +
  "                      <li class='list-group-item'>" +
  "                        <h4 class='inline-header'>Released date:</h4>" +
  "                        <span class='album-releaseDate'>" + album.releaseDate + "</span>" +
  "                      </li>" +

  buildSongsHtml(album.songs) +


  "                    </ul>" +
  "                  </div>" +
  "                </div>" +
  "                <!-- end of album internal row -->" +

  "              </div>" + // end of panel-body

  "              <div class='panel-footer'>" +
  "                <button class='btn btn-primary add-song'>Add Song</button>" +
  "                <button class='btn btn-info edit-song'>Edit Song</button>" +
  "                <button class='btn btn-primary delete-album'>Delete</button>" +
  "                <button class='btn btn-info edit-album'>Edit Album</button>" +
  "                <button class='btn btn-info save-changes default-hidden'>Save Changes</button>" +
  "              </div>" +
  "            </div>" +
  "          </div>" +
  "          <!-- end one album -->";

  $('#albums').prepend(albumHtml);
 }
