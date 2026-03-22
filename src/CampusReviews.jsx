import React, { useState, useEffect, useRef } from "react";
import Particles from "./Particles";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { uploadToCloudinary } from "./utils/uploadImage";
import "./index.css";

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - (ts?.seconds ? ts.seconds * 1000 : ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ name = "U", size = 36 }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const palette = ["#5227FF", "#9B59B6", "#2980B9", "#27AE60", "#E67E22", "#E74C3C"];
  const color = palette[name.charCodeAt(0) % palette.length];
  return (
    <div
      className="cr-avatar"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

// ── Likes Modal ────────────────────────────────────────────────────────────────
function LikesModal({ likeNames, onClose }) {
  return (
    <div className="cr-modal-overlay" onClick={onClose}>
      <div className="cr-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="cr-modal-header">
          <h3>Liked by</h3>
          <button className="cr-modal-close" onClick={onClose}>x</button>
        </div>
        {likeNames.length === 0 ? (
          <p className="cr-modal-empty">No likes yet.</p>
        ) : (
          <ul className="cr-likes-list">
            {likeNames.map((name, i) => (
              <li key={i} className="cr-likes-item">
                <Avatar name={name} size={32} />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Post Card ──────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onLike, onComment, onDeleteComment, onDeletePost }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showLikesModal, setShowLikesModal] = useState(false);
  const inputRef = useRef(null);

  const isLiked = post.likes?.includes(currentUser.uid);
  const likeCount = post.likes?.length || 0;
  const likeNames = post.likeNames || [];
  const isAdmin = currentUser?.role === "admin";
  const isOwner = post.authorId === currentUser.uid;

  // Admin can delete any post, student can delete only their own
  const canDeletePost = isAdmin || isOwner;

  // Admin can delete any comment, student can delete only their own
  const canDeleteComment = (comment) => isAdmin || comment.authorId === currentUser.uid;

  const handleSubmitComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    onComment(post.id, trimmed);
    setCommentText("");
  };

  return (
    <div className="cr-card">

      {/* Header — author name, time, delete button */}
      <div className="cr-card-header">
        <Avatar name={post.authorName} />
        <div className="cr-card-meta">
          <span className="cr-card-author">{post.authorName}</span>
          <span className="cr-card-time">{timeAgo(post.timestamp)}</span>
        </div>

        {canDeletePost && (
          <button
            className="cr-post-delete-btn"
            onClick={() => {
              if (window.confirm("Delete this post?")) onDeletePost(post.id);
            }}
          >
            x
          </button>
        )}
      </div>

      {/* Caption */}
      {post.caption && <p className="cr-card-caption">{post.caption}</p>}

      {/* Image */}
      {post.imageURL && (
        <div className="cr-card-img-wrap">
          <img src={post.imageURL} alt="post" className="cr-card-img" />
        </div>
      )}

      {/* Action Buttons — students like and comment, admin only comments */}
      <div className="cr-card-actions">
        {!isAdmin && (
          <button
            className={`cr-action-btn${isLiked ? " cr-liked" : ""}`}
            onClick={() => onLike(post)}
          >
            {isLiked ? "[ Liked ]" : "[ Like ]"}
          </button>
        )}
        <button
          className="cr-action-btn"
          onClick={() => {
            setShowComments(!showComments);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
        >
          [ Comment ]
        </button>
      </div>

      {/* Stats — like count and comment count */}
      <div className="cr-card-stats">
        {likeCount > 0 ? (
          <button className="cr-like-count-btn" onClick={() => setShowLikesModal(true)}>
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </button>
        ) : (
          <span className="cr-like-count-zero">No likes yet</span>
        )}
        <span className="cr-comment-count">
          {post.comments?.length || 0}{" "}
          {post.comments?.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="cr-comments-section">
          {post.comments?.length > 0 && (
            <ul className="cr-comments-list">
              {post.comments.map((c) => (
                <li key={c.id} className="cr-comment-item">
                  <Avatar name={c.authorName} size={28} />
                  <div className="cr-comment-body">
                    <span className="cr-comment-author">{c.authorName}</span>
                    <span className="cr-comment-text">{c.text}</span>
                    <span className="cr-comment-time">{timeAgo(c.timestamp)}</span>
                  </div>
                  {canDeleteComment(c) && (
                    <button
                      className="cr-comment-delete"
                      onClick={() => onDeleteComment(post.id, c)}
                    >
                      x
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="cr-comment-input-row">
            <Avatar name={currentUser.name} size={28} />
            <input
              ref={inputRef}
              className="cr-comment-input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
            />
            <button className="cr-comment-submit" onClick={handleSubmitComment}>
              Post
            </button>
          </div>
        </div>
      )}

      {/* Likes Modal */}
      {showLikesModal && (
        <LikesModal likeNames={likeNames} onClose={() => setShowLikesModal(false)} />
      )}
    </div>
  );
}

// ── Create Post — students only ────────────────────────────────────────────────
function CreatePost({ currentUser, onPost }) {
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("Campus");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Admin cannot post — only students
  if (currentUser?.role === "admin") return null;

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large. Please choose a file under 10MB.");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDiscard = () => {
    setOpen(false);
    setCaption("");
    setCategory("Campus");
    setImageFile(null);
    setPreview(null);
    setUploadProgress("");
  };

  const handleSubmit = async () => {
    if (!caption.trim() && !imageFile) {
      alert("Please add a caption or image.");
      return;
    }
    setUploading(true);
    setUploadProgress("Preparing post...");
    try {
      let imageURL = "";
      if (imageFile) {
        setUploadProgress("Uploading image...");
        imageURL = await uploadToCloudinary(imageFile);
        setUploadProgress("Saving post...");
      }
      await onPost({ caption: caption.trim(), category, imageURL });
      handleDiscard();
    } catch (err) {
      console.error(err);
      alert("Failed to post. Check your Cloudinary config and try again.");
      setUploadProgress("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="cr-create-wrap">
      {!open ? (
        <button className="cr-create-trigger" onClick={() => setOpen(true)}>
          + Share a Campus Tea
        </button>
      ) : (
        <div className="cr-create-form">
          <div className="cr-create-form-header">
            <Avatar name={currentUser.name} />
            <span className="cr-create-username">{currentUser.name}</span>
            <button className="cr-create-close" onClick={handleDiscard}>x</button>
          </div>

          <textarea
            className="cr-create-caption"
            placeholder="Spill the tea on campus..."
            value={caption}
            rows={3}
            onChange={(e) => setCaption(e.target.value)}
          />

          <div className="cr-create-row">
            <div className="cr-create-field">
              <label className="cr-create-label">Category</label>
              <select
                className="cr-create-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Campus">Campus</option>
                <option value="Event">Event</option>
                <option value="Food">Food</option>
              </select>
            </div>

            <div className="cr-create-field">
              <label className="cr-create-label">Photo (optional)</label>
              <label className="cr-upload-label">
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          {preview && (
            <div className="cr-create-preview-wrap">
              <img src={preview} alt="preview" className="cr-create-preview-img" />
              <button
                className="cr-create-remove-img"
                onClick={() => { setImageFile(null); setPreview(null); }}
              >
                x
              </button>
            </div>
          )}

          {uploadProgress && (
            <p className="cr-upload-progress">{uploadProgress}</p>
          )}

          <div className="cr-create-actions">
            <button className="cr-btn-post" onClick={handleSubmit} disabled={uploading}>
              {uploading ? "Posting..." : "Post"}
            </button>
            <button className="cr-btn-discard" onClick={handleDiscard}>
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
function CampusReviews({ setPage, currentUser }) {
  const [posts, setPosts] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const isAdmin = currentUser?.role === "admin";

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Add new post — only students reach this
  const handleNewPost = async ({ caption, category, imageURL }) => {
    await addDoc(collection(db, "reviews"), {
      authorId: currentUser.uid,
      authorName: currentUser.name,
      caption,
      category,
      imageURL,
      likes: [],
      likeNames: [],
      comments: [],
      timestamp: serverTimestamp(),
    });
  };

  // Toggle like — students only
  const handleLike = async (post) => {
    const postRef = doc(db, "reviews", post.id);
    const isLiked = post.likes?.includes(currentUser.uid);
    if (isLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(currentUser.uid),
        likeNames: arrayRemove(currentUser.name),
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(currentUser.uid),
        likeNames: arrayUnion(currentUser.name),
      });
    }
  };

  // Add comment — both students and admin can comment
  const handleComment = async (postId, text) => {
    const postRef = doc(db, "reviews", postId);
    const post = posts.find((p) => p.id === postId);
    const newComment = {
      id: `c_${Date.now()}`,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      text,
      timestamp: Date.now(),
    };
    await updateDoc(postRef, {
      comments: [...(post.comments || []), newComment],
    });
  };

  // Delete comment — admin deletes any, student deletes own
  const handleDeleteComment = async (postId, comment) => {
    const postRef = doc(db, "reviews", postId);
    const post = posts.find((p) => p.id === postId);
    await updateDoc(postRef, {
      comments: post.comments.filter((c) => c.id !== comment.id),
    });
  };

  // Delete post — admin deletes any, student deletes own
  const handleDeletePost = async (postId) => {
    await deleteDoc(doc(db, "reviews", postId));
  };

  const displayPosts = posts.filter(
    (p) => filterCategory === "All" || p.category === filterCategory
  );

  return (
    <div className="cr-root">
      <div className="cr-particles">
        <Particles particleColors={["#ffffff"]} particleCount={120} speed={0.3} />
      </div>

      <div className="cr-page">

        {/* Navbar */}
        <div className="cr-navbar">
          <div>
            <h2 className="cr-navbar-title">CAMPUS TEA</h2>
            <small className="cr-navbar-sub">
              {isAdmin ? "Moderating student posts" : "Share your campus tea"}
            </small>
          </div>
          <div className="cr-navbar-actions">
            <span className="cr-navbar-user">
              <Avatar name={currentUser?.name || "U"} size={30} />
              <span>{currentUser?.name}</span>
              {isAdmin && <span className="cr-admin-tag">Admin</span>}
            </span>
            <button className="cr-back-btn" onClick={() => setPage("home")}>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Admin notice banner */}
        {isAdmin && (
          <div className="cr-admin-banner">
            You are viewing as Admin. You can delete any post or comment.
          </div>
        )}

        {/* Body */}
        <div className="cr-body">

          {/* Feed */}
          <div className="cr-feed">

            {/* Create post — only shown to students */}
            <CreatePost currentUser={currentUser} onPost={handleNewPost} />

            {loading ? (
              <p className="cr-empty">Loading posts...</p>
            ) : displayPosts.length === 0 ? (
              <p className="cr-empty">No posts yet. Be the first to share!</p>
            ) : (
              displayPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onComment={handleComment}
                  onDeleteComment={handleDeleteComment}
                  onDeletePost={handleDeletePost}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="cr-sidebar">
            <div className="cr-sidebar-card">
              <h4 className="cr-sidebar-title">Filter by Category</h4>
              {["All", "Campus", "Event", "Food"].map((cat) => (
                <button
                  key={cat}
                  className={`cr-filter-btn${filterCategory === cat ? " cr-filter-active" : ""}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="cr-sidebar-card">
              <h4 className="cr-sidebar-title">Logged in as</h4>
              <div className="cr-sidebar-user">
                <Avatar name={currentUser?.name || "U"} size={40} />
                <div>
                  <p className="cr-sidebar-username">{currentUser?.name}</p>
                  <p className="cr-sidebar-userrole">
                    {isAdmin ? "Administrator" : "Student"}
                  </p>
                </div>
              </div>
            </div>

            <div className="cr-sidebar-card">
              <h4 className="cr-sidebar-title">About</h4>
              <p className="cr-sidebar-about">
                Students share campus life moments — events, food, and everyday
                college experiences. Like and comment to connect with peers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampusReviews;