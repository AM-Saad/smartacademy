function displayposts(posts, allpostsBox) {
    console.log(posts);
    
    var arabic = /[\u0600-\u06FF]/;
    $('.post').remove()
    posts.reverse()
    posts.forEach(e => {
        allpostsBox.append(`
            <div class='post'>
            <i class="fas fa-ellipsis-h post-sub-menu_btn" style="position: absolute; right: 9px;
            top: 4px;"></i>
            <input type="hidden" value="${e._id}" name="postId">
            <input type="hidden" value="${e.teacher}" name="teacherId">
            <ul class="post-sub-menu">
            <input type="hidden" value="${e._id}" name="postId">
                <li class="post-sub-menu_delete">Delete</li>
            </ul>
                <div class="post-header">
                    <div>
                        <p class="post-header_time">${e.date.slice(0, 10)}</p>

                    </div>
                <div class="flex">
                    <p class="post-header_type">
                        <i class="fas fa-${e.posttype == 'public' ? 'lock-open' : 'lock'}"></i>
                    </p>
                    <div class="post-info ${e.posttype == 'private' ? 'flex' : ''}">
                        <p>${e.group || ''}</p>
                        <p>${e.classroom || ''}</p>
                    </div>
                </div>
            </div>
            <div  class="post-body"> 
                <p style="${arabic.test(e.content) ? 'text-align:right;' : ''}">${e.content}</p>
                ${e.attachedlink ? `<a href="${e.attachedlink}" class="btn btn-main">Open</a>` : ''}
            </div>
            <img src="/${e.image}" class="post-img" alt="img">
            <input type="hidden" value="${e._id}" name="postId">
            <div class="post-actions">
                <input type="hidden" value="${e._id}" name="postId">
                <span class="showComments">Comments: ${e.comments}</span>
            </div>
            </div>
        `)


    });
}
